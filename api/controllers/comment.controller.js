import { errorHandler } from "../utils/error.js";
import Comment from "../models/comment.model.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, postID, userID } = req.body;
    if(req.body.userID !== userID){
      return next(errorHandler(403, 'You are not allowed to comment on this post'))
    }
    const newComment = new Comment({
      content,
      postID,
      userID,
    });
    await newComment.save();
    res.status(200).json(newComment);
  } catch (error) {
    next(error);
  }
}

export const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postID: req.params.postID }).sort({
      createdAt: -1,
    });
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};