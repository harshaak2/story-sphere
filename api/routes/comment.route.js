import express from 'express';

import { verifyToken } from '../utils/verifyUser.js';
import { createComment, editComment, getPostComments, likeComment, deleteComment, getComments } from '../controllers/comment.controller.js';

const router = express.Router();

router.post('/create', verifyToken, createComment);
router.get('/getpostcomments/:postID', getPostComments);
router.put('/likecomment/:commentID', verifyToken, likeComment);
router.put('/editcomment/:commentID', verifyToken, editComment);
router.delete('/deletecomment/:commentID', verifyToken, deleteComment);
router.get('/getcomments', verifyToken, getComments);

export default router;