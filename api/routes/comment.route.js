import express from 'express';

import { verifyToken } from '../utils/verifyUser.js';
import { createComment, editComment, getPostComments, likeComment } from '../controllers/comment.controller.js';

const router = express.Router();

router.post('/create', verifyToken, createComment);
router.get('/getpostcomments/:postID', getPostComments);
router.put('/likecomment/:commentID', verifyToken, likeComment);
router.put('/editComment/:commentID', verifyToken, editComment);

export default router;