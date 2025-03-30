import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../types";

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

UserSchema.methods.isPasswordValid = async function (password: string) {
  const verify = await bcrypt.compare(password, this.password);

  return verify;
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password as string, 10);
  next();
});

// Create and export the Mongoose model
const User = mongoose.model<IUser>("User", UserSchema);
export { User };
