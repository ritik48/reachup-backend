import { NextFunction, Request, Response } from "express";
import mongoose, { Document } from "mongoose";

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  isPasswordValid: (password: string) => Promise<boolean>;
}

export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  user: mongoose.Types.ObjectId;
  total: number;
}

export interface ILeadItem extends Document {
  _id: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  status: {
    type: String;
    enum: ["pending", "sent", "failed"];
    default: "pending";
  };
  emailSentAt?: Date;
}

export interface IEmailProvider extends Document {
  _id: mongoose.Types.ObjectId;
  provider: string;
  email: string;
  password: string;
  host: string;
  port: number;
  name: string;
  user: mongoose.Types.ObjectId;
}
