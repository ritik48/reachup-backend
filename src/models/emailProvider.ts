import mongoose, { Schema } from "mongoose";
import { IEmailProvider } from "../types";

const EmailProviderSchema = new Schema<IEmailProvider>({
  provider: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  host: { type: String, required: true },
  port: { type: Number, required: true },
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

const EmailProvider = mongoose.model("EmailProvider", EmailProviderSchema);
export { EmailProvider };
