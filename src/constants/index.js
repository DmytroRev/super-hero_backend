import path from 'path';
import { env } from '../utils/env.js';

export const AVATAR_DIR = path.join(process.cwd(), 'src', 'uploads', 'avatars');
export const IMAGE_DIR = path.join(process.cwd(), 'src', 'uploads', 'images');

export const CLOUDINARY = {
CLOUD_NAME: env('CLOUD_NAME'),
API_KEY: env('API_KEY'),
API_SECRET: env('API_SECRET')
};

