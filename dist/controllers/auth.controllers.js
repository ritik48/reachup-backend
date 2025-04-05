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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.loginUser = exports.createAccount = void 0;
const user_1 = require("../models/user");
const ApiError_1 = require("../utils/ApiError");
const auth_1 = require("../utils/auth");
const createAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const existingUser = yield user_1.User.findOne({ email });
    if (existingUser) {
        throw new ApiError_1.ApiError("User with this email already exists.", 400);
    }
    const newUser = new user_1.User({
        email,
        password,
        name,
    });
    yield newUser.save();
    res
        .status(201)
        .json({ success: true, message: "Account created successfully" });
});
exports.createAccount = createAccount;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log({ email, password });
    const userExists = yield user_1.User.findOne({ email });
    if (!userExists) {
        throw new ApiError_1.ApiError("Invalid Credentials.", 400);
    }
    const isPasswordValid = yield userExists.isPasswordValid(password);
    if (!isPasswordValid) {
        throw new ApiError_1.ApiError("Invalid Credentials.", 400);
    }
    const token = (0, auth_1.generateAccessToken)(userExists);
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
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
        success: true,
    });
});
exports.loginUser = loginUser;
const logoutUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
    };
    res
        .status(201)
        .clearCookie("token", options)
        .json({ message: "You are logged out.", success: true });
});
exports.logoutUser = logoutUser;
