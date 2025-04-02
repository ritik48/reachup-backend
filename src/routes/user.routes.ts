import express, { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { isAuthenticated } from "../utils/auth";

const userRoute = express.Router();

userRoute.get(
  "/",
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.json({
      success: true,
      message: "You are authenticated.",
      user: req.user,
    });
  })
);

export { userRoute };
