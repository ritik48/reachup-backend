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
  filePath?: string;
  processed: boolean;
}

export interface ILeadItem extends Document {
  _id: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  email: string;
  name?: string;
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

export type IJob = {
  _id: mongoose.Types.ObjectId;
  execution: mongoose.Schema.Types.ObjectId;
  workflow: mongoose.Schema.Types.ObjectId;
  leadItem: mongoose.Schema.Types.ObjectId;
  // emailTemplate: mongoose.Schema.Types.ObjectId;
  status: "scheduled" | "sent" | "failed";
  scheduledTime: Date;
  sentTime: Date;
  delayDuration: number; // in minutes
  error: string;
  retryCount: number;
};

export type IExecutionSchema = {
  _id: mongoose.Types.ObjectId;
  workflow: mongoose.Schema.Types.ObjectId;
  leadSource: mongoose.Schema.Types.ObjectId;
  status: "running" | "completed" | "failed";
  totalLeads: number;
  processedLeads: number;
  failedLeads: number;
  startTime: Date;
  endTime: Date;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
};

export type IWorkflow = {
  _id: mongoose.Types.ObjectId;
  name: string;
  nodes: string;
  edges: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  active: boolean;
  emailProvider: mongoose.Types.ObjectId;
};
