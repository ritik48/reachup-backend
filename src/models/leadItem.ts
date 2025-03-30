import mongoose, { Schema } from "mongoose";
import { ILeadItem } from "../types";

const LeadItemSchema = new Schema<ILeadItem>({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true }, // Reference to Lead
  email: { type: String, required: true },
  firstname: { type: String },
  lastname: { type: String },
  company: { type: String },
  status: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
  emailSentAt: { type: Date },
});

const LeadItem = mongoose.model("LeadItem", LeadItemSchema);
export { LeadItem };
