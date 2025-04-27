import express from 'express';
import { ping, newPrompt, rephraseContent, summariseContent } from '../controllers/ai.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/ping', ping)
router.post('/prompt', newPrompt)
router.post('/rephrase', rephraseContent)
router.post('/summarise', summariseContent)

export default router;