import express from 'express';
import {
  createCharacterController,
  deleteCharacterController,
  getAllCharactersController,
  getCharacterByIdController,
  updateCharacterAvatar,
  updateCharacterController,
} from '../controllers/characterControllers.js';
import upload from '../middleware/uploadMiddleware.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();
const jsonParser = express.json();
// //get all superhero
// router.get('/', async (req, res) => {
//     try {
//         const characters = await Character.find();
//         res.status(200).send(characters);
//     } catch (err) {
// res.status(500).send({error: err.message});
//     }
// });

// //getting a character by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const character = await Character.findById(req.params.id);
//         if(!character) return res.status(404).send({error: 'Character not found!'});
//         res.status(200).send(character);
//     } catch (err) {
// res.status(500).send({error: err.message});
//     }
// });

// //create new hero
// router.post('/', async (req, res) => {
//     try {
//         const character = new Character(req.body);
//         await character.save();
//         res.status(201).send(character);
//     } catch (err) {
// res.status(400).send({error: err.message});
//     }
// });

// //update hero by id
// router.patch('/:id', async (req, res) => {
//     try {
//         const character = await Character.findByIdAndDelete(req.params.id, req.body, {new: true, runValidators: true});
//         if(!character) return res.status(404).send({error: 'Character not found!'});
//         res.status(200).send(character);
//     } catch (err) {
// res.status(400).send({error: err.message});
//     }
// });

// //delete hero
// router.delete('/:id', async (req, res) => {
//     try {
//         const character = await Character.findByIdAndDelete(req.params.id);
//         if(!character) return res.status(404).send({error: 'Character not found'});
//         res.status(200).send(character);
//     } catch (err) {
// res.status(500).send({error: err.message});
//     }
// });

// export default router;

router.get('/', ctrlWrapper(getAllCharactersController));

router.get('/:id', ctrlWrapper(getCharacterByIdController));

router.post(
  '/',
  jsonParser,
  ctrlWrapper(createCharacterController),
);

router.patch('/:id', jsonParser, ctrlWrapper(updateCharacterController));

router.post('/:id/avatar',  upload.single('avatar'), jsonParser, ctrlWrapper(updateCharacterAvatar));

router.delete('/:id', ctrlWrapper(deleteCharacterController));

export default router;
