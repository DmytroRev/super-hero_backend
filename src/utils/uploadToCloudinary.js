import cloudinary from 'cloudinary';
import { CLOUDINARY } from '../constants/index.js';
import fs from 'node:fs/promises';

cloudinary.v2.config({
  cloud_name: CLOUDINARY.CLOUD_NAME,
  api_key: CLOUDINARY.API_KEY,
  api_secret: CLOUDINARY.API_SECRET,
});

export const uploadToCloudinary = async (filePath) => {
  const response = await cloudinary.v2.uploader.upload(filePath); // response содержит secure_url
  await fs.unlink(filePath); // Удаляем временный файл после загрузки
  return response; // Возвращаем объект ответа, включая secure_url
};
