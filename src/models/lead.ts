import mongoose, { Schema } from "mongoose";
import { ILead } from "../types";

const LeadSchema: Schema = new Schema<ILead>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create and export the Mongoose model
const Lead = mongoose.model<ILead>("Lead", LeadSchema);
export { Lead };
