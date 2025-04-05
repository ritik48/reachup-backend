import express, { NextFunction, Request, Response } from "express";
import { configDotenv } from "dotenv";

import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoute } from "./routes/auth.routes";
import { userRoute } from "./routes/user.routes";
import { connectDB } from "./utils/db";
import { ApiError } from "./utils/ApiError";
import { leadsRoute } from "./routes/leads.routes";
import { agenda } from "./utils/agendaInit";
import { workflowRoute } from "./routes/workflow.routes";

configDotenv();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH"],
  })
);

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/leads", leadsRoute);
app.use("/workflow", workflowRoute);

app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const { status = 500, message = "Something went wrong" } = err;

  console.log({ status, message });
  res.status(status).json({
    message,
    success: false,
  });
});

connectDB()
  .then(() => {
    agenda.start().then(() => {
      console.log("Agenda started");

      app.listen(3000, () => console.log("LISTENING ON 3000"));
    });
  })
  .catch((err) => {
    console.log("Cannot connect to databse ", err);
    process.exit(1);
  });
