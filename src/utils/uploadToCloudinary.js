import cloudinary from 'cloudinary';
import { CLOUDINARY } from '../constants/index.js';
import fs from 'node:fs/promises';

cloudinary.v2.config({
  cloud_name: CLOUDINARY.CLOUD_NAME,
  api_key: CLOUDINARY.API_KEY,
  api_secret: CLOUDINARY.API_SECRET,
});

// function uploadToCloudinary(filePath) {
// return cloudinary.uploader.upload(filePath);
// };

// export {uploadToCloudinary};

export const uploadToCloudinary = async (file) => {
  const response = await cloudinary.v2.uploader.upload(file.path);
  await fs.unlink(file.path);
  return response.secure_url;
};
