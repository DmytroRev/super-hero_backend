import Character from '../db/models/Character.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import path from 'path';
import * as fs from 'fs/promises';
import cloudinary from 'cloudinary';
export const getAllCharacters = async ({ page = 1, perPage = 5 }) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const [characterCount, characters] = await Promise.all([
    Character.countDocuments(),
    Character.find().skip(skip).limit(limit),
  ]);

  const paginationData = calculatePaginationData(characterCount, perPage, page);

  return {
    data: characters,
    ...paginationData,
  };
};

export const getCharacterById = async (characterId) => {
  return Character.findById(characterId);
};

export const createCharacter = async (characterData) => {
  const character = new Character(characterData);
  await character.save();
  return character;
};

export const updateCharacter = async (id, data, file) => {
  const character = await Character.findById(id);
  if (!character) {
    throw new Error('Character not found!');
  }

  if (file) {
    character.avatarUrl = `/uploads/photos/${file.filename}`;

    const avatarPath = path.resolve(('src', 'uploads', file.filename));
    await fs.rename(file.path, avatarPath);
  }

  if (file) {
    character.imageUrl = `/uploads/photos/${file.filename}`;

    const avatarPath = path.resolve(('src', 'uploads', file.filename));
    await fs.rename(file.path, avatarPath);
  }

  character.nickname = data.nickname || character.nickname;
  character.real_name = data.real_name || character.real_name;
  character.origin_description =
    data.origin_description || character.origin_description;
  character.superpowers = data.superpowers || character.superpowers;
  character.catch_phrase = data.catch_phrase || character.catch_phrase;
  character.imageUrl = data.imageUrl || character.imageUrl;

  await character.save();
  return character;
};

export const changeCharacterAvatar = async (userId, image) => {
  return Character.findByIdAndUpdate(
    userId,
    { avatarUrl: image },
    { new: true },
  );
};

export const deleteCharacterImage = async (
  characterId,
  imageUrl,
  remove = false,
) => {
  try {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Image not found!');
    }

    if (remove) {
      character.imageUrl = character.imageUrl.filter((url) => url !== imageUrl);
    } else {
      character.imageUrl.push(imageUrl);
    }

    await character.save();

    return character.imageUrl;
  } catch (err) {
    throw new Error('Error delete character image:', err);
  }
};

export const deleteCharacter = async (id, avatarPublicId, imagesPublicIds) => {
  const character = await Character.findById(id);
  if (!character) {
    throw new Error('Character not found!');
  }

  // Удаление аватара из Cloudinary
  if (avatarPublicId) {
    try {
      await cloudinary.v2.uploader.destroy(avatarPublicId);
    } catch (err) {
      console.error('Error deleting avatar from Cloudinary:', err.message);
    }
  }

  // Удаление изображений из Cloudinary
  if (imagesPublicIds && imagesPublicIds.length > 0) {
    for (const publicId of imagesPublicIds) {
      if (publicId) {
        try {
          await cloudinary.v2.uploader.destroy(publicId);
        } catch (err) {
          console.error('Error deleting image from Cloudinary:', err.message);
        }
      }
    }
  }

  await Character.findByIdAndDelete(id);
  return { message: 'Character deleted successfully!' };
};
