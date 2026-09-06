import { Router } from 'express';
import {
  generate, listImages, getImage, deleteImage, addFavorite, removeFavorite, getPromptHistory,
} from '../controllers/images.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { generationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(requireAuth);

router.post('/generate', generationLimiter, generate);
router.get('/', listImages);
router.get('/:id', getImage);
router.delete('/:id', deleteImage);
router.post('/:id/favorite', addFavorite);
router.delete('/:id/favorite', removeFavorite);

export default router;
