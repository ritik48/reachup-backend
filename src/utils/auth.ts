import jwt from "jsonwebtoken";

import { User } from "../models/user";
import { ApiError } from "./ApiError";
import { asyncHandler } from "./AsyncHandler";
import { NextFunction, Request, Response } from "express";
import { IUser } from "../types";

const isAuthenticated = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
      throw new ApiError("You are not logged in !!!", 401);
    }

    let verifyToken;
    try {
      verifyToken = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      throw new ApiError("You are not authenticated. Login again", 403);
    }

    const user = await User.findById(verifyToken);

    if (!user) {
      throw new ApiError("Invalid Access Token", 401);
    }
    req.user = user;

    next();
  }
);

const generateAccessToken = (user: IUser) => {
  try {
    const token = jwt.sign(user._id.toString(), process.env.JWT_SECRET!);
    return token;
  } catch (error) {
    console.log(error);
    throw new ApiError(
      "Something went wrong while generating access token.",
      500
    );
  }
};

export { generateAccessToken, isAuthenticated };
