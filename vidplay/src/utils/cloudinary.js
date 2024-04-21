import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

          
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
const deleteOnCloudinary = async (url) => {
  try {
      if(!url) return null;
      //delete file on cloudinary
    const deleteOnCloudinary = await cloudinary.uploader.destroy(cloudinary.url,{resource_type: "auto"})
       return deleteOnCloudinary; 

  } catch (error) {
      console.log("Error in Removing File",error)
      return null;
      
  }
};

export {uploadOnCloudinary,cloudinary,deleteOnCloudinary};
