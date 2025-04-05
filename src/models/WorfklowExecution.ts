import mongoose, { Schema } from "mongoose";
import { IExecutionSchema } from "../types";

const executionSchema = new mongoose.Schema<IExecutionSchema>({
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: "Workflow" },
  leadSource: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  status: {
    type: String,
    enum: ["running", "completed", "failed"],
    default: "running",
  },
  totalLeads: Number,
  processedLeads: { type: Number, default: 0 },
  failedLeads: { type: Number, default: 0 },
  startTime: Date,
  endTime: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

// Create and export the Mongoose model
const WorkflowExecution = mongoose.model<IExecutionSchema>(
  "WorkflowExecution",
  executionSchema
);
export { WorkflowExecution };
