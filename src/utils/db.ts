import { configDotenv } from "dotenv";
import mongoose from "mongoose";
configDotenv();

const connectDB = async () => {
  const connection = await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/futureblink"
  );
  console.log("Database connected: ", connection.connection.host);
};

export { connectDB };
