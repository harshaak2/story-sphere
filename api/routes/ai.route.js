import express from 'express';
import { ping, newPrompt } from '../controllers/ai.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/ping', ping)
router.post('/prompt', newPrompt)

export default router;