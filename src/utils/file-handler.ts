import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage instead of disk storage
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit (keep same)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".csv"];
    const extname = path.extname(file.originalname);
    if (allowedTypes.includes(extname)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

import csvParser from "csv-parser";
import fs from "fs";
import { error } from "console";
import { Readable } from "stream";

const parseCSV = (buffer: Buffer, singleRow: boolean = false): Promise<any> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    let headers: string[] = [];

    const stream = Readable.from(buffer.toString())
      .pipe(csvParser())
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

const deleteFile = async (filePath: string) => {
  const resolvedPath = path.resolve(filePath);
  console.log({ resolvedPath });
  return new Promise((resolve, reject) => {
    fs.unlink(resolvedPath, (err) => {
      if (err) {
        console.log("errrrrrrrrrrrr", err);
        reject(err);
      } else {
        console.log("sucessssssssssssssss");
        resolve("File deleted");
      }
    });
  });
};

export { upload, parseCSV, deleteFile };
