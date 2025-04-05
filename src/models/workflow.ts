import mongoose, { Schema } from "mongoose";
import { IWorkflow } from "../types";

const workflowSchema = new mongoose.Schema<IWorkflow>({
  name: String,
  nodes: String,
  edges: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: false },
  emailProvider: { type: Schema.Types.ObjectId, ref: "EmailProvider" },
});

const Workflow = mongoose.model<IWorkflow>("Workflow", workflowSchema);
export { Workflow };
