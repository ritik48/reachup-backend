"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
const express_1 = __importDefault(require("express"));
const AsyncHandler_1 = require("../utils/AsyncHandler");
const auth_1 = require("../utils/auth");
const user_controllers_1 = require("../controllers/user.controllers");
const userRoute = express_1.default.Router();
exports.userRoute = userRoute;
userRoute.get("/", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(user_controllers_1.fetchCurrentUser));
userRoute.get("/email-sender", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(user_controllers_1.fetchUserEmails));
userRoute.post("/email-sender", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(user_controllers_1.addEmailSender));
userRoute.delete("/email-sender", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(user_controllers_1.deleteEmailSender));
userRoute.post("/verify-email", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(user_controllers_1.verifyEmailSender));
