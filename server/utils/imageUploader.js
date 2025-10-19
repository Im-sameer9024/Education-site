import { v2 as cloudinary } from 'cloudinary';

const uploadImageToCloudinary = async (fileBuffer, originalName, folder) => {
  try {
    const base64String = fileBuffer.toString('base64');
    const fileType = originalName.split('.').pop();

    const file = `data:image/${fileType};base64,${base64String}`;

    const options = {
      folder: folder,
      width: 500,
      height: 500,
      crop: 'fill',
      quality: 60,
      resource_type: 'auto',
    };

    return await cloudinary.uploader.upload(file, options);
  } catch (error) {
    throw new Error(error.message || 'Could not upload image to cloudinary');
  }
};

export default uploadImageToCloudinary;
