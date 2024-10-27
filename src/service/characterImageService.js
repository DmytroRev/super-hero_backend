import fs from 'fs/promises';
import path from 'path';
import Character from '../db/models/Character.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

export const localImagePath = (filename) => {
  return path.resolve('src', 'uploads', 'images', filename);
};

export const changeCharacterImages = async (
  characterId,
  imageUrls,
  isRemove = false,
) => {
  const character = await Character.findById(characterId);

  if (!character) {
    throw new Error('Character not found!');
  }

  if (isRemove) {
    character.imageUrl = character.imageUrl.filter(
      (url) => !imageUrls.includes(url),
    );
  } else {
    imageUrls.forEach((url) => {
      if (!character.imageUrl.includes(url)) {
        character.imageUrl.push(url);
      }
    });
  }

  await character.save();
};

export const handleImageUpload = async (file) => {
  let secureUrl;

  if (process.env.ENABLE_CLOUDINARY === 'true') {
    secureUrl = await uploadToCloudinary(file);
    await fs.unlink(file.path);
  } else {
    const localPath = localImagePath(file.filename);
    await fs.rename(file.path, localPath);
    secureUrl = `http://localhost:3000/image/${file.filename}`;
  }
  return secureUrl;
};
