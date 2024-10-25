import Character from '../db/models/Character.js';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import {
  changeCharacterAvatar,
  //   changeCharacterAvatar,
  deleteCharacter,
  getAllCharacters,
  getCharacterById,
  updateCharacter,
} from '../service/characterService.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';


//get all characters
// export const getAllCharacters = async (req, res) => {
//     try {
//         const character = await Character.find();
//         res.status(200).send(character);
//     } catch (err) {
// res.status(500).send({error: err.message});
//     }
// };

//get character by id
// export const getCharacterById = async (req, res) => {
// try {
//     const character = await Character.findById(req.params.id);
//     if(!character) return res.status(404).send({error: 'Character not found'});
//     res.status(200).send(character);
// } catch (err) {
// res.status(500).send({error: err.message});
// }
// };
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

//create a new character
// export const createCharacter = async (req, res) => {
//     console.log('Request body:', req.body);
//     console.log('Uploaded file:', req.file);
//     try {
//         const characterData = {
//             name: req.body.name,
//             nickname: req.body.nickname,
//             real_name: req.body.real_name,
//             origin_description: req.body.origin_description,
//             superpowers: req.body.superpowers,
//             catch_phrase: req.body.catch_phrase,
//             image: req.file ? `/images/${req.file.filename}` : null
//         };
// const character = new Character(characterData);
// await character.save();
// res.status(201).send(character);
//         // const character = new Character(req.body);
//         // await character.save();
//         // res.status(201).send(character);
//     } catch (err) {
// res.status(400).send({error: err.message});
//     }
// };

export const createCharacterController = async (req, res) => {
  try {
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const newCharacter = new Character({
      avatarUrl,
      name: req.body.name,
      nickname: req.body.nickname,
      real_name: req.body.real_name,
      origin_description: req.body.origin_description,
      superpowers: req.body.superpowers,
      catch_phrase: req.body.catch_phrase,
      imageUrl: req.body.imageUrl || null,
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

//update character by id
// export const updateCharacter = async (req, res) => {
//     try {
//         const character = await Character.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
//         if(!character) return res.status(404).send({error: 'Character not found!'});
//         res.status(200).send(character);
//     } catch (err) {
// res.status(400).send({error: err.message});
//     }
// };

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

export const updateCharacterAvatarController = async (req, res) => {

  if (process.env.ENABLE_CLOUDINARY === 'true') {
    const response = await uploadToCloudinary(req.file.path);
    await fs.unlink(req.file.path);
    await changeCharacterAvatar(req.params.id, response.secure_url);

  } else {
    const localPath = path.resolve('src', 'uploads', 'avatars', req.file.filename);
      await fs.rename(req.file.path, localPath);
      await changeCharacterAvatar(req.params.id, `http://localhost:3000/avatars${req.file.filename}`);
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  res.send({ status: 200, message: 'Avatar changed successfully!' });
};

//delete character
// export const deleteCharacter = async (req, res) => {
//     try {
//         const character = await Character.findByIdAndDelete(req.params.id);
//         if(!character) return res.status(404).send({error: 'Character not found!'});
//         res.status(200).send(character);
//     } catch (err) {
// res.status(500).send({error: err.message});
//     }
// };

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
