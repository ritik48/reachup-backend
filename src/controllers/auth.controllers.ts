import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import { ApiError } from "../utils/ApiError";
import { generateAccessToken } from "../utils/auth";

export const createAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError("User with this email already exists.", 400);
  }

  const newUser = new User({
    email,
    password,
    name,
  });
  await newUser.save();

  res
    .status(201)
    .json({ success: true, message: "Account created successfully" });
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (!userExists) {
    throw new ApiError("Invalid Credentials.", 400);
  }

  const isPasswordValid = await userExists.isPasswordValid(password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid Credentials.", 400);
  }

  const token = generateAccessToken(userExists);
  console.log({ token });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: true,
  };

  const userWithoutPassword = Object.assign({}, userExists.toJSON());
  delete userWithoutPassword.password;

  res
    .status(200)
    .cookie("token", token, options)
    .json({
      message: `You are logged in, ${userExists.name}`,
      token: token,
      user: userWithoutPassword,
    });

  res
    .status(201)
    .json({ success: true, message: "Account created successfully" });
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: true,
  };

  res
    .status(201)
    .clearCookie("token", options)
    .json({ message: "You are logged out." });
};
