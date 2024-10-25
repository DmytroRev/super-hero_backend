import express from 'express';
import {
  createCharacterController,
  deleteCharacterController,
  getAllCharactersController,
  getCharacterByIdController,
  updateCharacterAvatarController,
  updateCharacterController,
} from '../controllers/characterControllers.js';
import upload from '../middleware/uploadMiddleware.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();
const jsonParser = express.json();

router.get('/', ctrlWrapper(getAllCharactersController));

router.get('/:id', ctrlWrapper(getCharacterByIdController));

router.post(
  '/',
  jsonParser,
  ctrlWrapper(createCharacterController),
);

router.patch('/:id', jsonParser, ctrlWrapper(updateCharacterController));

router.post('/:id/avatar',  upload.single('avatar'), jsonParser, ctrlWrapper(updateCharacterAvatarController));

router.delete('/:id', ctrlWrapper(deleteCharacterController));

export default router;
