import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { User} from "../models/user.model.js"
import {cloudinary, uploadOnCloudinary,deleteOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { extractPublicId } from "cloudinary-build-url";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new apiError(500, "Something went wrong while generating referesh and access token")
    }
}
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered Successfully")
    )


} )
const loginUser = asyncHandler(async (req, res) => {
    //req body data 
    //username or email
    //find user check in db 
    //password check
    //access and refresh token generation
    //send cookie
    // send success response

    const {email,username,password}=req.body
    if(!(username || email)){
        throw new apiError(400, "Provide either username or email")
    }
   const user = await User.findOne({$or:[{username},{email}]})

if (!user) {
    throw new apiError(401, "Invalid credentials")
}
 const isPasswordValid = await user.isPasswordCorrect(password);
 if (!isPasswordValid) {
    throw new apiError(401, "Invalid credentials")
}
 
const{accessToken,refreshToken}= await generateAccessAndRefereshTokens(user._id);

const loggedInUser= await User.findByIdAndUpdate(user._id)
.select("-password -refreshToken")

const cookieOptions = {
    httpOnly: true,
    secure: true
}
    return res.status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(new apiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully")) 

})
const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(req.user._id,{$unset:{refreshToken:1}},{new:true})
   const cookieOptions = {
    httpOnly: true,
    secure: true
}
    return res.status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(new apiResponse(200,{},"User logged out successfully"))
})
const refreshAccessToken = asyncHandler(async(req,res)=>{
const incomingRefreshToken= req.cookies.refreshToken|| req.body.refreshToken
 if(!incomingRefreshToken){
        throw new apiError(401,"unauthorized request")
    }
    try {
       const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
       const user = await User.findById(decodedToken?._id)
       if(!user){
        throw new apiError(401,"Invalid Refresh Token")
    }
    if(user?.refreshToken!==incomingRefreshToken){
        throw new apiError(401,"Refresh Token is expired/used")
    }
    const cookieOptions = {
        httpOnly: true,
        secure: true
    }
     const{accessToken,newRefreshToken}= await generateAccessAndRefereshTokens(user._id);
    
     return res
     .status(200)
     .cookie("accessToken",accessToken,cookieOptions)
     .cookie("refreshToken",newRefreshToken,cookieOptions)
     .json(new apiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "Access Token Refreshed Successfully"
            ))
} catch (error) {
    throw new apiError(401,error?.message||"Invalid Refresh Token")
}
})
const changeCurrentPassword= asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    if(!oldPassword || !newPassword){
        throw new apiError(400,"Old and New Password are required")
    }
   const user = await User.findById(req.user?._id);
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
         throw new apiError(400,"Old Password is incorrect")
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false})
    return res.status(200).json(new apiResponse(200,{},"Password changed successfully"))
})
const getCurrentUser = asyncHandler(async(req,res)=>{
   res.status(200).json(new apiResponse(200,req.User,"User details fetched successfully"))
})
const updateUserProfile = asyncHandler(async(req,res)=>{
    const{fullName,email} = req.body
    if(!(fullName || !email)){
        throw new apiError(400,"Full Name and Email are required")
    }
    const user = User.findByIdAndUpdate(req.user?._id,{$set:{fullName,email}},{new:true})
    .select("-password -refreshToken")
    return res.status(200).json(new apiResponse(200,user,"User profile updated successfully"))
})
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required");
    }

    let userId = await User.findById(req.user?._id)
    const avatarUrl = extractPublicId(userId?.avatar);
    
    if (!avatarUrl) {
        throw new apiError(400, "Avatar URL is missing in user object");
    }

   
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new apiError(400, "Failed to upload new avatar to Cloudinary");
    }


    const removeAvatar = await deleteOnCloudinary(avatarUrl);
    if (!removeAvatar) {
        throw new apiError(400, "Failed to remove avatar from Cloudinary");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Avatar image updated successfully")
    )
})
const updateCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!coverImageLocalPath){
        throw new apiError(400,"coverImage is not Uploaded");
    }
    let findUser = await User.findById(req.user?._id)
    const coverImageUrl = extractPublicId(findUser?.coverImage);
    
    if (!coverImageUrl) {
        throw new apiError(400, "Cover Image URL is missing in user object");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImageLocalPath){
        throw new apiError(400,"Failed to Upload on cloudinary");
    }
    const removeCoverImage = await deleteOnCloudinary(coverImageUrl);
    if (!removeCoverImage) {
        throw new apiError(400, "Failed to remove Cover Image from Cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Cover image updated successfully")
    )
})
const getUserChannelProfile = asyncHandler(async(req,res)=>{
const {username}=req.params
 if(!username?.trim){
        throw new apiError(400,"Username is required")
    }
 const channel = await User.aggregate([{
    $match:{username:username?.toLowerCase()}

 },{
    $lookup:{from:Subscription?.toLowerCase(),localField:"_id",foreignField:"channel",as:"subscribers"}
 },
 {
    $lookup:{from:Subscription?.toLowerCase(),localField:"_id",foreignField:"subscribers",as:"subscribedTo"}
 },
 {
    $add:{totalSubscribers:{$size:"$subscribers"},totalSubscribedTo:{$size:"$subscribedTo"},isSubscribed:{$cond:{if:{$in:[req.user?._id,"subscribers.subscriber"]},
    then:true,
    else:false
}}}
 },{
    $project:{fullName:1,username:1,subscribers:1,subscribedTo:1,isSubscribed:1,avatar:1,coverImage:1,email:1}
 }
])
if(!channel?.length){
    throw new apiError(404,"Channel not found")
}
return res.status(200).json(new apiResponse(200,channel[0],"Channel Profile Fetched Successfully"))
})
const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{_id: new mongoose.Types.ObjectId(req.user._id)}
        },{
            $lookup:{from:"videos",localField:"watchHistory",foreignField:"_id",as:"watchHistory",
            pipeline:[{$lookup:{from:"users",localField:"owner",foreignField:"_id",as:"owner",
            pipeline:[{
                $project:{fullName:1,username:1,avatar:1}
            
            }]
        }},{
            $addFields:{owner:{$first:"$owner"}}
        }
    
    ]}
        },
    ])
    return res.status(200).json(new apiResponse(200,user[0]?.watchHistory,"Watch History Fetched Successfully"))
})
export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateUserProfile,updateUserAvatar,updateCoverImage,getUserChannelProfile,getWatchHistory};  