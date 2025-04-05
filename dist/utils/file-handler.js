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
exports.deleteFile = exports.parseCSV = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(), // Use memory storage instead of disk storage
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit (keep same)
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [".csv"];
        const extname = path_1.default.extname(file.originalname);
        if (allowedTypes.includes(extname)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only CSV files are allowed"));
        }
    },
});
exports.upload = upload;
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = require("stream");
const parseCSV = (buffer, singleRow = false) => {
    return new Promise((resolve, reject) => {
        const results = [];
        let headers = [];
        const stream = stream_1.Readable.from(buffer.toString())
            .pipe((0, csv_parser_1.default)())
            .on("headers", (h) => {
            headers = h;
        })
            .on("data", (row) => {
            results.push(row);
            singleRow && stream.destroy();
        })
            .on("close", () => {
            resolve({ headers, row: results[0] || {} });
        })
            .on("end", () => {
            resolve(results);
        })
            .on("error", (err) => {
            reject(err);
        });
    });
};
exports.parseCSV = parseCSV;
const deleteFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const resolvedPath = path_1.default.resolve(filePath);
    console.log({ resolvedPath });
    return new Promise((resolve, reject) => {
        fs_1.default.unlink(resolvedPath, (err) => {
            if (err) {
                console.log("errrrrrrrrrrrr", err);
                reject(err);
            }
            else {
                console.log("sucessssssssssssssss");
                resolve("File deleted");
            }
        });
    });
});
exports.deleteFile = deleteFile;
