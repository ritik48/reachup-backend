import express, { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { isAuthenticated } from "../utils/auth";
import {
  addEmailSender,
  fetchCurrentUser,
  fetchUserEmails,
  verifyEmailSender,
} from "../controllers/user.controllers";

const userRoute = express.Router();

userRoute.get("/", isAuthenticated, asyncHandler(fetchCurrentUser));
userRoute.get("/email-sender", isAuthenticated, asyncHandler(fetchUserEmails));
userRoute.post("/email-sender", isAuthenticated, asyncHandler(addEmailSender));
userRoute.post(
  "/verify-email",
  isAuthenticated,
  asyncHandler(verifyEmailSender)
);

export { userRoute };
