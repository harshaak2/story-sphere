import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, getPosts, deletePost, updatePost } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create);
router.get('/getposts', getPosts);
router.delete('/deletepost/:postID/:userID', verifyToken, deletePost);
router.put('/updatepost/:postID/:userID', verifyToken, updatePost);

export default router;