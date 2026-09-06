import { Router } from 'express';
import { getPromptHistory } from '../controllers/images.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getPromptHistory);

export default router;
