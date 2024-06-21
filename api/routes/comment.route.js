import express from 'express';

import { verifyToken } from '../utils/verifyUser.js';
import { createComment, getPostComments, likeComment } from '../controllers/comment.controller.js';

const router = express.Router();

router.post('/create', verifyToken, createComment);
router.get('/getpostcomments/:postID', getPostComments);
router.put('/likecomment/:commentID', verifyToken, likeComment);

export default router;