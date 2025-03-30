import express, { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { isAuthenticated } from "../utils/auth";
// import { createAccount, loginUser } from "../controllers/auth.controllers";

const userRoute = express.Router();

userRoute.get(
  "/",
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.json({ authenticated: true });
  })
);

export { userRoute };
