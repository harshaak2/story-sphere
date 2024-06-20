import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  postID: {
    type: String,
    required: true,
  }, 
  userID: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  numberOfLikes: {
    type: Number,
    default: 0,
  },
} , {timestamps: true});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;