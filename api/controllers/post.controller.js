import { errorHandler } from "../utils/error.js";
import Post from "../models/post.model.js";
import redisClient from "../utils/redis.js";

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Not authorized to create a post"));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }
  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");
  const newPost = new Post({
    ...req.body,
    slug,
    userID: req.user.id,
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const cacheKey = `posts_${startIndex}_${limit}_${sortDirection}_${req.query.userID || ""}_${req.query.category || ""}_${req.query.slug || ""}_${req.query.postID || ""}_${req.query.searchTerm || ""}`;
    redisClient.get(cacheKey, async (error, cachedData) => {
      if (error) {
        next(error);
      }
      if (cachedData) {
        return res.status(200).json(JSON.stringify(cachedData));
      } else {
        const posts = await Post.find({
          ...(req.query.userID && { userID: req.query.userID }),
          ...(req.query.category && { category: req.query.category }),
          ...(req.query.slug && { slug: req.query.slug }),
          ...(req.query.postID && { _id: req.query.postID }),
          ...(req.query.searchTerm && {
            $or: [
              { title: { $regex: req.query.searchTerm, $options: "i" } },
              { content: { $regex: req.query.searchTerm, $options: "i" } },
            ],
          }),
        })
          .sort({ updatedAt: sortDirection })
          .skip(startIndex)
          .limit(limit);

        const totalPosts = await Post.countDocuments();
        const now = new Date();
        const oneMonthAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        const lastMonthPosts = await Post.find({
          createdAt: { $gte: oneMonthAgo },
        });

        const response = { posts, totalPosts, lastMonthPosts };
        redisClient.setex(cacheKey, 3600, JSON.stringify(response));
        res.status(200).json(response);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userID) {
    return next(errorHandler(403, "Not authorized to delete a post"));
  }
  try {
    await Post.findByIdAndDelete(req.params.postID);
    res.status(200).json("Post has been deleted");
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userID) {
    return next(errorHandler(403, "You are not allowed to update this post"));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postID,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};
