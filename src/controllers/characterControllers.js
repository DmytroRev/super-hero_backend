import Character from '../db/models/Character.js';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import {
  changeCharacterAvatar,
  // changeCharacterImages,
  deleteCharacter,
  getAllCharacters,
  getCharacterById,
  updateCharacter,
  // updateCharacter,
} from '../service/characterService.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import {
  changeCharacterImages,
  handleImageUpload,
} from '../service/characterImageService.js';
import { PHOTO_DIR } from '../constants/index.js';
import { env } from '../utils/env.js';
// import { AVATAR_DIR } from '../constants/index.js';

//get all character controller
export const getAllCharactersController = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 5;

  try {
    const characters = await getAllCharacters({ page, perPage });
    res.status(200).json({
      status: 200,
      message: 'Successfuly found characters!',
      data: characters.data,
      pagination: characters.paginationData,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

//get character by id controller
export const getCharacterByIdController = async (req, res) => {
  try {
    const character = await getCharacterById(req.params.id);
    if (!character) {
      return res.status(404).send({ error: 'Character not found!' });
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found character with id ${req.params.id}`,
      data: character,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

//create a new character controller
export const createCharacterController = async (req, res) => {
  try {
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;
    const imagesUrl = req.file ? `/uploads/images/${req.file.filename}` : null;

    const newCharacter = new Character({
      avatarUrl,
      name: req.body.name,
      nickname: req.body.nickname,
      real_name: req.body.real_name,
      origin_description: req.body.origin_description,
      superpowers: req.body.superpowers,
      catch_phrase: req.body.catch_phrase,
      imagesUrl,
    });
    await newCharacter.save();

    if (req.file) {
      const avatarPath = path.resolve(
        'src',
        'uploads',
        'avatars',
        req.file.filename,
      );
      await fs.rename(req.file.path, avatarPath);
    }
    res.status(201).json({
      status: 201,
      message: 'Character created successfully!',
      data: newCharacter,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

//update character by id controller
export const updateCharacterController = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedCharacter = await updateCharacter(id, req.body, req.file);
    res.status(200).json({
      status: 200,
      message: 'Character updated successfully!',
      data: updatedCharacter,
    });
  } catch (err) {
    if (err.message === 'Character not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).send({ error: err.message });
  }
};

//update character avatar controller
export const updateCharacterAvatarController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    let avatarUrl;
    const filePath = req.file.path;

    if (env('ENABLE_CLOUDINARY') === 'true') {
      const response = await uploadToCloudinary(filePath); // передаем только путь
      // await fs.unlink(req.file.path);
      // await changeCharacterAvatar(req.params.id, response.secure_url);
      avatarUrl = response.secure_url; // Получаем URL из ответа Cloudinary
    } else {
      const localPath = path.resolve(PHOTO_DIR, req.file.filename);
      await fs.rename(req.file.path, localPath);
      avatarUrl = `http://localhost:3000/uploads/photos/${req.file.filename}`;

      // await changeCharacterAvatar(
      //   req.params.id,
      //   `http://localhost:3000/uploads/photos/${req.file.filename}`,
      // );
    }
    await changeCharacterAvatar(req.params.id, avatarUrl);

    res.send({
      status: 200,
      message: 'Avatar changed successfully!',
      url: avatarUrl,
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const extractPublicId = (url) => {
  const parts = url.split('/');
  return parts[parts.length - 1].split('.')[0];
};

export const removeCharacterAvatarController = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found!' });
    }

    const avatarUrl = character.avatarUrl;

    if (process.env.ENABLE_CLOUDINARY === 'true') {
      const publicId = extractPublicId(avatarUrl);
      await uploadToCloudinary(publicId);
    } else {
      const localPath = path.resolve(
        'src',
        'uploads',
        'avatars',
        avatarUrl.split('/').pop(),
      );
      await fs.unlink(localPath).catch((err) => {
        console.error(`Error deleting file ${err}`);
      });
    }
    await Character.findByIdAndUpdate(req.params.id, { avatarUrl: null });
    res.status(200).json({ message: 'Avatar deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//add character images array controller
export const addCharacterImagesController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = await Promise.all(req.files.map(handleImageUpload));
    await changeCharacterImages(req.params.id, imageUrls);
    res.send({ status: 200, message: 'Images added successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

//add delete image character controller
export const removeCharacterImageController = async (req, res) => {
  try {
    const { imagesUrl } = req.body;
    const characterId = req.params.id;

    await changeCharacterImages(characterId, imagesUrl, true);

    res.send({ status: 200, message: 'Image removed successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

//delete character controller
export const deleteCharacterController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteCharacter(id);
    res.status(200).json({
      status: 200,
      message: result.message,
    });
  } catch (err) {
    if (err.message === 'Character not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).send({ error: err.message });
  }
};
