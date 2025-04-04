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
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
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

const parseCSV = (
  filePath: string,
  singleRow: boolean = false
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    let headers: string[] = [];

    const stream = fs
      .createReadStream(filePath)
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
