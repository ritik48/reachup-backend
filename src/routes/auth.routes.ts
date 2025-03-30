import express from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { createAccount, loginUser, logoutUser } from "../controllers/auth.controllers";

const authRoute = express.Router();

authRoute.post("/login", asyncHandler(loginUser));
authRoute.post("/signup", asyncHandler(createAccount));
authRoute.post("/logout", asyncHandler(logoutUser));

export { authRoute };
