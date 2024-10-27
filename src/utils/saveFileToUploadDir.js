import fs from 'node:fs/promises';
import path from 'node:path';
import { PHOTO_DIR, TMP_UPLOAD_DIR } from '../constants';
export const saveFileToUploadDir = async (file) => {
  const targetPath = path.join(PHOTO_DIR, file.filename);

  try {
    // Перемещаем файл из временной директории в целевую
    await fs.rename(path.join(TMP_UPLOAD_DIR, file.filename), targetPath);

    // Возвращаем URL на основе типа файла
    const baseUrl = process.env.APP_DOMAIN || 'http://localhost:3000';
    return `${baseUrl}/uploads/photos/${file.filename}`;
  } catch (error) {
    console.error('Error moving file:', error);
    throw new Error('Failed to save file.');
  }
};
