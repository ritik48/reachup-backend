import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import { ApiError } from "../utils/ApiError";
import { generateAccessToken } from "../utils/auth";
import { Lead } from "../models/lead";

import fs from "fs";
import csvParser from "csv-parser";
import { deleteFile, parseCSV } from "../utils/file-handler";
import { LeadItem } from "../models/leadItem";

export const fetchLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  const data = await Lead.find({ user: userId });

  res.status(200).json({ success: true, data });
};

export const updateLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!id) {
    throw new ApiError("Invalid request", 400);
  }

  const lead = await Lead.findById(id);
  if (!lead) throw new ApiError("Lead not found.", 400);

  await Lead.updateOne({ _id: id }, { title });

  res.status(201).json({ success: true, message: "Lead updated successfully" });
};
export const deleteLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!id) throw new ApiError("Invalid request", 400);

  const lead = await Lead.findById(id);
  if (!lead) throw new ApiError("Lead not found.", 400);

  await Lead.deleteOne({ _id: id });

  res.status(201).json({ success: true, message: "Lead deleted successfully" });
};

export const fetchLeadItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!id) throw new ApiError("Invalid request", 400);

  const data = await LeadItem.find({ leadId: id });

  res.status(200).json({ success: true, data });
};

export const deleteLeadItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!id) throw new ApiError("Invalid request", 400);

  const lead = await LeadItem.findById(id);
  if (!lead) throw new ApiError("Not found.", 400);

  await LeadItem.deleteOne({ _id: id });

  res.status(201).json({ success: true, message: "Row deleted successfully" });
};

export const createLeads = async (req: Request, res: Response) => {
  const filePath = req.file?.path;
  if (!filePath) {
    throw new ApiError("No file provided.", 400);
  }

  const { rows, title } = req.body;
  if (!rows || !title) throw new ApiError("Invalid request", 400);

  const keys = (JSON.parse(rows) as string[]).map((k: string) =>
    k.toLowerCase()
  );

  let leadsResult;
  try {
    leadsResult = await parseCSV(req.file?.path!);

    // create new lead category
    const newLead = await Lead.create({ title, user: req.user?._id });

    // update to have leads with only the keys that user selected in the frontend
    const formattedLead = leadsResult
      .map((obj) => {
        return Object.keys(obj)
          .filter((key) => keys.includes(key.toLowerCase()))
          .reduce((acc, key) => {
            acc[key.toLowerCase()] = obj[key];
            acc["leadId"] = newLead._id;
            return acc;
          }, {} as Record<string, any>);
      })
      .filter((f) => Object.keys(f).length !== 0);

    // save individual rows
    await LeadItem.insertMany(formattedLead);
  } catch (error) {
    throw new ApiError("Error while reading the file", 500);
  } finally {
    // delete the file from server once the leads are saved
    await deleteFile(req.file?.path!);
  }
  res.status(201).json({ success: true, message: "Leads added successfull." });
};
