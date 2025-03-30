import mongoose, { Schema } from "mongoose";
import { IEmailProvider } from "../types";

const EmailProviderSchema = new Schema<IEmailProvider>({
  provider: { type: String, required: true },
  email: { type: String, required: true },
  access_token: { type: String, required: true },
  refresh_token: { type: String, required: true },
});

const EmailProvider = mongoose.model("EmailProvider", EmailProviderSchema);
export { EmailProvider };
