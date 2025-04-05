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
exports.deleteEmailSender = exports.verifyEmailSender = exports.addEmailSender = exports.fetchUserEmails = exports.fetchCurrentUser = void 0;
const emailProvider_1 = require("../models/emailProvider");
const nodemailerTransport_1 = require("../utils/nodemailerTransport");
const ApiError_1 = require("../utils/ApiError");
const fetchCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        success: true,
        message: "You are authenticated.",
        user: req.user,
    });
});
exports.fetchCurrentUser = fetchCurrentUser;
const fetchUserEmails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const emailProviders = yield emailProvider_1.EmailProvider.find({ user: user._id });
    res.status(200).json({
        success: true,
        data: emailProviders,
    });
});
exports.fetchUserEmails = fetchUserEmails;
const addEmailSender = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, port, host, password, name, provider } = req.body;
    if (!email || !port || !host || !password) {
        throw new ApiError_1.ApiError("Please provide all fields.", 400);
    }
    // check if the email is already added
    const existingEmail = yield emailProvider_1.EmailProvider.findOne({ email });
    if (existingEmail) {
        throw new ApiError_1.ApiError("This sender is already added.", 400);
    }
    // verify the email credentials
    const transporter = (0, nodemailerTransport_1.nodemailerTransport)(host, port, email, password);
    try {
        yield transporter.verify();
    }
    catch (error) {
        console.error("SMTP connection error:", error);
        throw new ApiError_1.ApiError("Email could not be verified.", 400);
    }
    // create the email provider
    const newEmailSender = yield emailProvider_1.EmailProvider.create({
        email,
        port,
        host,
        password,
        name,
        provider,
        user: req.user._id,
    });
    res.status(200).json({
        success: true,
        message: "Email sender added successfully.",
        data: newEmailSender,
    });
});
exports.addEmailSender = addEmailSender;
const verifyEmailSender = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!id) {
        throw new ApiError_1.ApiError("Invalid request", 400);
    }
    const emailProvider = yield emailProvider_1.EmailProvider.findById(id);
    if (!emailProvider) {
        throw new ApiError_1.ApiError("Email provider not found.", 404);
    }
    const { email, host, port, password } = emailProvider;
    const transporter = (0, nodemailerTransport_1.nodemailerTransport)(host, port, email, password);
    try {
        const result = yield transporter.verify();
        res.status(200).json({ success: true, message: "This sender is working." });
    }
    catch (error) {
        res
            .status(200)
            .json({ success: false, message: "Email sender is not working." });
    }
});
exports.verifyEmailSender = verifyEmailSender;
const deleteEmailSender = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!id) {
        throw new ApiError_1.ApiError("Invalid request", 400);
    }
    yield emailProvider_1.EmailProvider.findOneAndDelete({ _id: id });
    res.status(200).json({
        success: true,
        message: "Email sender deleted successfully.",
    });
});
exports.deleteEmailSender = deleteEmailSender;
