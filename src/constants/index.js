import path from 'path';
import { env } from '../utils/env.js';

export const PHOTO_DIR = path.join(process.cwd(), 'src', 'uploads', 'photos');
// export const IMAGE_DIR = path.join(process.cwd(), 'src', 'uploads', 'images');
export const TMP_UPLOAD_DIR = path.join(process.cwd(), 'tmp');

export const CLOUDINARY = {
  CLOUD_NAME: env('CLOUD_NAME'),
  API_KEY: env('API_KEY'),
  API_SECRET: env('API_SECRET'),
};
