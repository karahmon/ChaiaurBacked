import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { User} from "../models/user.model.js"
import {cloudinary, uploadOnCloudinary,deleteOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


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
   await User.findByIdAndUpdate(req.user._id,{$set:{refreshToken:undefined}},{new:true})
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
   res.status(200).json(new apiResponse(200,req.user,"User details fetched successfully"))
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
const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }
    const removeAvatar = await deleteOnCloudinary(req.user?.avatar)
    if(!removeAvatar){
        throw new apiError(400,"Failed to Remove Avatar from Cloudinary")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new apiError(400, "Avatar file is required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{$set:{avatar:avatar.url}},{new:true})
    .select("-password -refreshToken")
    return res.status(200).json(new apiResponse(200,user,"User avatar updated successfully"))
})
const updateCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new apiError(400,"coverImage is not Uploaded");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImageLocalPath){
        throw new apiError(400,"Failed to Upload on cloudinary");
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{$set:{coverImage:coverImage.url}},{new:true})
    .select("-password, -refreshToken")
    return res.status(200).json(new apiResponse(200,user,"Cover Image updated successfully"))
})
export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateUserProfile,updateUserAvatar,updateCoverImage};  