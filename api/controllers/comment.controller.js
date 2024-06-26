// import { useEffect } from "react";
import { errorHandler } from "../utils/error.js";
import Comment from "../models/comment.model.js";
import redisClient from "../utils/redis.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, postID, userID } = req.body;
    if (req.body.userID !== userID) {
      return next(
        errorHandler(403, "You are not allowed to comment on this post")
      );
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
};

export const getPostComments = async (req, res, next) => {
  try {
    const postID = req.params.postID;
    const cacheKey = `comments_${postID}`;
    redisClient.get(cacheKey, async (error, cachedData) => {
      if (error) {
        return next(error);
      }
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      } else {
        const comments = await Comment.find({ postID }).sort({
          createdAt: -1,
        });
        if (comments.length > 0) {
          redisClient.setex(cacheKey, 3600, JSON.stringify(comments));
          res.status(200).json(comments);
        }
        // res.status(200).json(comments);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentID);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      comment.numberOfLikes += 1;
      comment.likes.push(req.user.id);
    } else {
      comment.numberOfLikes -= 1;
      comment.likes.splice(userIndex, 1);
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentID);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    if (req.user.id !== comment.userID || !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to edit this comment")
      );
    }
    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentID,
      { content: req.body.content },
      { new: true }
    );
    res.status(200).json(editedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentID);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    if (req.user.id !== comment.userID || !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to delete this comment")
      );
    }
    await Comment.findByIdAndDelete(req.params.commentID);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to view comments"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "desc" ? -1 : 1;
    const cacheKey = `comments_${startIndex}_${limit}_${sortDirection}`;
    redisClient.get(cacheKey, async (error, cachedData) => {
      if (error) {
        return next(error);
      }
      if (cachedData) {
        return res.status(200).json(JSON.stringify(cachedData));
      } else {
        const comments = await Comment.find()
          .sort({ createdAt: sortDirection })
          .skip(startIndex)
          .limit(limit);
        const totalComments = await Comment.countDocuments();
        const now = new Date();
        const oneMonthAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        const commentsInLastMonth = await Comment.countDocuments({
          createdAt: { $gte: oneMonthAgo },
        });
        const response = { comments, totalComments, commentsInLastMonth };
        res.status(200).json(response);
      }
    });
  } catch (error) {
    next(error);
  }
};
