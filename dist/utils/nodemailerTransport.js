"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodemailerTransport = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailerTransport = (host, port, email, password) => {
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure: false, // Using TLS
        auth: {
            user: email,
            pass: password,
        },
        connectionTimeout: 10000,
    });
};
exports.nodemailerTransport = nodemailerTransport;
