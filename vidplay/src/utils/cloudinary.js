import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

          
cloudinary.config({ 
  cloud_name:(process.env.CLOUD_NAME), 
  api_key: (process.env.API_KEY), 
  api_secret: (process.env.API_SECRET) 
});
          
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload file to cloudinary
      const response = await cloudinary.uploader.upload(localFilePath,{resource_type: "auto"})
        console.log("File is Uploaded Successfully",response.url)
        return response; 

    } catch (error) {
        fs.unlinkSync(localFilePath); //removes the locally saved file as operation got failed
        console.log("Error in Uploading File",error)
        return null;
        
    }
}; 

export default uploadOnCloudinary;
