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
// import { changeCharacterImages } from '../service/characterImageService.js';
import { PHOTO_DIR } from '../constants/index.js';
import { env } from '../utils/env.js';
import cloudinary from 'cloudinary';
// import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';

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
    const {
      nickname,
      real_name,
      origin_description,
      superpowers,
      catch_phrase,
    } = req.body;

    // Проверяем наличие обязательных полей
    if (
      !nickname ||
      !real_name ||
      !origin_description ||
      !superpowers ||
      !catch_phrase
    ) {
      return res.status(400).send({ error: 'All fields are required.' });
    }

    // Инициализация URL для аватара
    let avatarUrl = null;

    // Проверка наличия файла аватара
    if (req.file) {
      const filePath = req.file.path; // Путь к загруженному файлу

      // Если включена загрузка в Cloudinary
      if (env('ENABLE_CLOUDINARY') === 'true') {
        const response = await uploadToCloudinary(filePath); // Загружаем файл в Cloudinary
        avatarUrl = response.secure_url; // Получаем URL из ответа
      } else {
        // Локальное сохранение аватара
        const localPath = path.resolve('uploads', 'avatars', req.file.filename);
        await fs.rename(req.file.path, localPath); // Перемещение файла в папку
        avatarUrl = `http://localhost:3000/uploads/avatars/${req.file.filename}`; // Создаем URL для локального файла
      }
    }

    // Создаем нового персонажа
    const newCharacter = new Character({
      avatarUrl,
      nickname,
      real_name,
      origin_description,
      superpowers,
      catch_phrase,
    });

    // Сохраняем персонажа в базе данных
    await newCharacter.save();

    res.status(201).json({
      status: 201,
      message: 'Character created successfully!',
      data: newCharacter,
    });
  } catch (err) {
    console.error('Error creating character:', err);
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
  const matches = url.match(/\/([^/]+)\.\w+$/); // Убрали обратный слеш перед косой чертой
  return matches ? matches[1] : null; // Возвращает только идентификатор
};

export const removeCharacterAvatarController = async (req, res) => {
  try {
    const characterId = req.params.id; // Убедитесь, что ID извлекается правильно

    if (!characterId) {
      return res.status(400).json({ error: 'Character ID is required.' });
    }

    console.log('Fetching character with ID:', characterId); // Логирование ID
    const character = await Character.findById(characterId);

    if (!character) {
      return res.status(404).json({ error: 'Character not found!' });
    }

    const avatarUrl = character.avatarUrl;

    if (!avatarUrl) {
      return res.status(400).json({ error: 'Avatar URL is empty!' });
    }

    // Удаление аватара
    if (process.env.ENABLE_CLOUDINARY === 'true') {
      const publicId = extractPublicId(avatarUrl); // Извлекаем public_id из URL
      await cloudinary.v2.uploader.destroy(publicId); // Удаляем аватар из Cloudinary
    } else {
      const localPath = path.resolve(PHOTO_DIR, avatarUrl.split('/').pop());
      await fs.unlink(localPath).catch((err) => {
        console.error(`Error deleting file: ${err}`); // Логирование ошибок
      });
    }

    // Удаление URL аватара из базы данных
    await Character.findByIdAndUpdate(characterId, { avatarUrl: null });

    res.status(200).json({ message: 'Avatar deleted successfully!' });
  } catch (err) {
    console.error('Failed to delete avatar:', err);
    res.status(500).json({ error: err.message });
  }
};

//add character images array controller
export const addCharacterImagesController = async (req, res) => {
  try {
    // Проверяем, были ли загружены файлы
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Загружаем изображения на Cloudinary и получаем их URL
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const response = await cloudinary.v2.uploader.upload(file.path);
        await fs.unlink(file.path); // Удаляем временный файл после загрузки
        return response.secure_url;
      }),
    );

    // Находим персонажа и добавляем новые URL-адреса в массив изображений
    const character = await Character.findByIdAndUpdate(
      req.params.id,
      { $push: { imageUrl: { $each: imageUrls } } }, // Добавляем URL-адреса к массиву
      { new: true },
    );

    // Отправляем обновлённого персонажа и загруженные URL-адреса
    res.status(200).json({ character, urls: imageUrls });
  } catch (error) {
    console.error('Error adding images:', error);
    res.status(500).json({ error: error.message });
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
