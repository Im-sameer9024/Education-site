import { v2 as cloudinary } from 'cloudinary';
import "dotenv/config.js";


const cloudinaryConnect = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
  } catch (error) {
    console.log('Error in cloudinary config file');
  }
};

export default cloudinaryConnect;
