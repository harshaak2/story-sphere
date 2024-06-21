// import { useEffect } from "react"; 
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

export const likeComment = async (req, res, next) => {
  console.log(req.user.id);
  try {
    const comment = await Comment.findById(req.params.commentID);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    // console.log(userIndex);
    if(userIndex === -1){
      comment.numberOfLikes += 1;
      comment.likes.push(req.user.id);
    }
    else{
      comment.numberOfLikes -= 1;
      comment.likes.splice(userIndex, 1);
    }
    console.log(comment.numberOfLikes);
    await comment.save();
    res.status(200).json(comment);
  }
  catch(error){
    next(error);
  }
}