import {asyncHandler} from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js';

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
    
});

export {registerUser};