import bcryptjs from "bcryptjs";

import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import redisClient from "../utils/redis.js";

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userID) {
    return next(errorHandler(403, "Not allowed to update user"));
  }
  if (req.body.password) {
    if (req.body.password.length < 8) {
      return next(errorHandler(400, "Password must be at least 8 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 7 and 20 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username  cannot contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username cannot have uppercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userID,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userID) {
    return next(errorHandler(403, "Not allowed to delete user"));
  }
  try {
    await User.findByIdAndDelete(req.params.userID);
    res.status(200).json({ message: "User has been deleted" });
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see the users list"));
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const cacheKey = `users_${startIndex}_${limit}_${sortDirection}`;

    redisClient.get(cacheKey, async (err, cachedData) => {
      if (err) {
        return next(err);
      }
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      } else {
        const users = await User.find()
          .sort({ createdAt: sortDirection })
          .skip(startIndex)
          .limit(limit);
        const usersWithoutPassword = users.map((user) => {
          const { password, ...rest } = user._doc;
          return rest;
        });

        const totalUsers = await User.countDocuments();
        const now = new Date();
        const oneMonthAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        const lastMonthUsers = await User.countDocuments({
          createdAt: {
            $gte: oneMonthAgo,
          },
        });

        const response = {
          users: usersWithoutPassword,
          totalUsers,
          lastMonthUsers,
        };
        redisClient.setex(cacheKey, 3600, JSON.stringify(response));
        res.status(200).json(response);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const userID = req.params.userID;
    const cacheKey = `user_${userID}`;
    redisClient.get(cacheKey, async (error, cachedData) => {
      if (error) {
        return next(error);
      }
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      } else {
        const user = await User.findById(req.params.userID);
        if (!user) {
          return next(errorHandler(404, "User not found"));
        }
        const { password, ...rest } = user._doc;
        redisClient.setex(cacheKey, 3600, JSON.stringify(rest));
        res.status(200).json(rest);
      }
    });
  } catch (error) {
    next(error);
  }
};
