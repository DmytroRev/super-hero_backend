import path from 'path';
import { env } from '../utils/env.js';

// export const TEMP_UPLOAD_DIR =
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'photos');

export const CLOUDINARY = {
CLOUD_NAME: env('CLOUD_NAME'),
API_KEY: env('API_KEY'),
API_SECRET: env('API_SECRET')
};
