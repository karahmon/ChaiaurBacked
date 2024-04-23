import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import { apiResponse } from './apiResponse.js';
import { type } from 'os';
import { apiError } from './apiError.js';

          
cloudinary.config({ 
  cloud_name:(process.env.CLOUDINARY_CLOUD_NAME), 
  api_key: (process.env.CLOUDINARY_API_KEY), 
  api_secret: (process.env.CLOUDINARY_API_SECRET) 
});
          
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload file to cloudinary
      const response = await cloudinary.uploader.upload(localFilePath,{resource_type: "auto"})
        //console.log("File is Uploaded Successfully",response.url)
        fs.unlinkSync(localFilePath); //removes the locally saved file after uploading to cloudinary
        return response; 

    } catch (error) {
        fs.unlinkSync(localFilePath); //removes the locally saved file as operation got failed
        console.log("Error in Uploading File",error)
        return null;
        
    }
}; 
const deleteOnCloudinary = async (avatarUrl) => {
  try {
      if(!avatarUrl) return apiError(400, "Avatar file is required");
      const response = await cloudinary.uploader.destroy(avatarUrl,{invalidate:true });      
      return new apiResponse(200, "File Deleted Successfully",response);

  } catch (error) {
      return new apiError(400, "Error in Deleting File",error);
      
  }
};

export {uploadOnCloudinary,cloudinary,deleteOnCloudinary};
