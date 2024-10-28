// import fs from 'fs/promises';
// import path from 'path';
// import Character from '../db/models/Character.js';
// import cloudinary from 'cloudinary';
// import { PHOTO_DIR } from '../constants/index.js';

// // Создаем путь для локального хранения, если понадобится
// export const localImagePath = (filename) => {
//   return path.resolve(PHOTO_DIR, filename);
// };

// // Основная функция контроллера для добавления изображений
// export const addCharacterImagesController = async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded' });
//     }

//     const imageUrls = await Promise.all(
//       req.files.map(async (file) => {
//         // Загружаем изображения на Cloudinary
//         const result = await cloudinary.v2.uploader.upload(file.path);
//         await fs.unlink(file.path); // Удаляем временные файлы
//         return result.secure_url;
//       }),
//     );

//     // Добавляем ссылки изображений в массив персонажа
//     const character = await Character.findByIdAndUpdate(
//       req.params.id,
//       { $push: { imageUrl: { $each: imageUrls } } },
//       { new: true },
//     );

//     res.status(200).json({ character, urls: imageUrls });
//   } catch (error) {
//     console.error('Error adding images:', error);
//     res.status(500).json({ error: error.message });
//   }
// };
