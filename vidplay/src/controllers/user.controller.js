import {asyncHandler} from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js';
import uploadOnCloudinary, {cloudinary} from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';

const registerUser= asyncHandler(async (req, res) => {
   // get user details from frontend
   // validation - not empty
   // check if user exists from bith username and email
   // check for images
   // check for avatar
   // upload in cloudinary,avatar
   // create user object - create entry in db
   // remove password and refresh token field
   // check for user creation
   // return response

   const {fullName,userName, email, password} = req.body;
   console.log(fullName,userName, email, password);
   if([fullName,userName, email, password].some((field)=>field?.trim()==='')){
    throw new apiError(400,"All Fields are required");
   }
   const existedUser= User.findOne({$or:[{userName},{email}]});
        if(existedUser){
            throw new apiError(409,"User already exists");
        }

        const avatarLocalPath=req.files?.avatar[0]?.path;
        const coverImageLocalPath=req.files?.coverImage[0]?.path;

        if(!avatarLocalPath){
            throw new apiError(400,"Avatar is required");
        }
     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if(!avatar){
        throw new apiError(400,"Avatar is required");
    }
    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        userName:userNametoLowerCase(),
    })
   const createdUser= await user.findbyId(user._id).select("-password -refreshToken");
   if(!createdUser){
    throw new apiError(500,"User not created");
   }
   return res.status(201).json(new apiResponse(200,createdUser,"User created"))
});

export {registerUser};