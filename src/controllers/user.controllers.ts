import { NextFunction, Request, Response } from "express";
import { EmailProvider } from "../models/emailProvider";
import { nodemailerTransport } from "../utils/nodemailerTransport";
import { ApiError } from "../utils/ApiError";

export const fetchCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json({
    success: true,
    message: "You are authenticated.",
    user: req.user,
  });
};

export const fetchUserEmails = async (req: Request, res: Response) => {
  const user = req.user!;

  const emailProviders = await EmailProvider.find({ user: user._id });

  res.status(200).json({
    success: true,
    data: emailProviders,
  });
};

export const addEmailSender = async (req: Request, res: Response) => {
  const { email, port, host, password, name, provider } = req.body;

  if (!email || !port || !host || !password) {
    throw new ApiError("Please provide all fields.", 400);
  }

  // check if the email is already added
  const existingEmail = await EmailProvider.findOne({ email });
  if (existingEmail) {
    throw new ApiError("This sender is already added.", 400);
  }

  // verify the email credentials
  const transporter = nodemailerTransport(host, port, email, password);
  try {
    await transporter.verify();
  } catch (error) {
    console.error("SMTP connection error:", error);
    throw new ApiError("Email could not be verified.", 400);
  }

  // create the email provider
  const newEmailSender = await EmailProvider.create({
    email,
    port,
    host,
    password,
    name,
    provider,
    user: req.user!._id,
  });

  res.status(200).json({
    success: true,
    message: "Email sender added successfully.",
    data: newEmailSender,
  });
};

export const verifyEmailSender = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    throw new ApiError("Invalid request", 400);
  }

  const emailProvider = await EmailProvider.findById(id);
  if (!emailProvider) {
    throw new ApiError("Email provider not found.", 404);
  }
  const { email, host, port, password } = emailProvider;

  const transporter = nodemailerTransport(host, port, email, password);

  try {
    const result = await transporter.verify();
    res.status(200).json({ success: true, message: "This sender is working." });
  } catch (error) {
    res
      .status(200)
      .json({ success: false, message: "Email sender is not working." });
  }
};

export const deleteEmailSender = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    throw new ApiError("Invalid request", 400);
  }

  await EmailProvider.findOneAndDelete({ _id: id });

  res.status(200).json({
    success: true,
    message: "Email sender deleted successfully.",
  });
};
