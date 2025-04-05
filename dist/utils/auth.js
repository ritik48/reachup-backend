"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const user_1 = require("../models/user");
const ApiError_1 = require("./ApiError");
const AsyncHandler_1 = require("./AsyncHandler");
const isAuthenticated = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token) {
        throw new ApiError_1.ApiError("You are not logged in !!!", 401);
    }
    let verifyToken;
    try {
        verifyToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (err) {
        throw new ApiError_1.ApiError("You are not authenticated. Login again", 403);
    }
    const user = yield user_1.User.findById(verifyToken);
    if (!user) {
        throw new ApiError_1.ApiError("Invalid Access Token", 401);
    }
    req.user = user;
    next();
}));
exports.isAuthenticated = isAuthenticated;
const generateAccessToken = (user) => {
    try {
        const token = jsonwebtoken_1.default.sign(user._id.toString(), process.env.JWT_SECRET);
        return token;
    }
    catch (error) {
        console.log(error);
        throw new ApiError_1.ApiError("Something went wrong while generating access token.", 500);
    }
};
exports.generateAccessToken = generateAccessToken;
