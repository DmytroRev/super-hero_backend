import express from 'express';
import {
  addCharacterImagesController,
  createCharacterController,
  deleteCharacterController,
  getAllCharactersController,
  getCharacterByIdController,
  removeCharacterAvatarController,
  removeCharacterImageController,
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
  upload.single('avatar'),
  jsonParser,
  ctrlWrapper(createCharacterController),
);

router.patch('/:id', jsonParser, ctrlWrapper(updateCharacterController));

router.patch(
  '/:id/avatar',
  upload.single('avatar'),
  jsonParser,
  ctrlWrapper(updateCharacterAvatarController),
);

router.delete('/:id/avatar', ctrlWrapper(removeCharacterAvatarController));

router.post(
  '/:id/image',
  upload.array('images'),
  jsonParser,
  ctrlWrapper(addCharacterImagesController),
);

router.delete('/:id/image', ctrlWrapper(removeCharacterImageController));

router.delete('/:id', ctrlWrapper(deleteCharacterController));

export default router;
