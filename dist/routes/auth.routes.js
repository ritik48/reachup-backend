"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoute = void 0;
const express_1 = __importDefault(require("express"));
const AsyncHandler_1 = require("../utils/AsyncHandler");
const auth_controllers_1 = require("../controllers/auth.controllers");
const authRoute = express_1.default.Router();
exports.authRoute = authRoute;
authRoute.post("/login", (0, AsyncHandler_1.asyncHandler)(auth_controllers_1.loginUser));
authRoute.post("/signup", (0, AsyncHandler_1.asyncHandler)(auth_controllers_1.createAccount));
authRoute.post("/logout", (0, AsyncHandler_1.asyncHandler)(auth_controllers_1.logoutUser));
