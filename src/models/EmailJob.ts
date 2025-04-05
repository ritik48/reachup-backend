import mongoose from "mongoose";
import { IJob } from "../types";

const emailJobSchema = new mongoose.Schema<IJob>({
  execution: { type: mongoose.Schema.Types.ObjectId, ref: "WorkflowExecution" },
  leadItem: { type: mongoose.Schema.Types.ObjectId, ref: "LeadItem" },
  status: {
    type: String,
    enum: ["scheduled", "sent", "failed"],
    default: "scheduled",
  },
  scheduledTime: Date,
  sentTime: Date,
  delayDuration: Number, // in minutes
  error: String,
  retryCount: { type: Number, default: 0 },
});

const EmailJob = mongoose.model<IJob>("EmailJob", emailJobSchema);
export { EmailJob };
