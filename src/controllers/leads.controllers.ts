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
  try {
    const userId = req.user?.id;

    // Get all leads for the user
    const leads = await Lead.find({ user: userId });

    // For each lead, count the number of LeadItems that reference it
    const leadsWithItemCounts = await Promise.all(
      leads.map(async (lead) => {
        const totalItems = await LeadItem.countDocuments({ leadId: lead._id });
        return {
          ...lead.toObject(),
          total: totalItems,
        };
      })
    );

    res.status(200).json({ success: true, data: leadsWithItemCounts });
  } catch (error) {
    next(error);
  }
};

export const fetchLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const data = await Lead.find({ _id: id });

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
  await LeadItem.deleteMany({ leadId: id });

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

  const lead = await Lead.findById(id);
  if (!id) throw new ApiError("Lead not found.", 400);

  const data = await LeadItem.find({ leadId: id });

  res.status(200).json({
    success: true,
    data: { title: lead?.title, leads: data, processed: lead?.processed },
  });
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

export const createLead = async (req: Request, res: Response) => {
  const { title } = req.body;

  if (!title) throw new ApiError("Invalid request", 400);

  const newLead = await Lead.create({ title, user: req.user?._id });

  res.status(201).json({
    success: true,
    id: newLead._id,
    message: "Lead created successfully",
  });
};

export const uploadFile = async (req: Request, res: Response) => {
  const filePath = req.file?.path;
  const { id } = req.body;
  if (!filePath || !id) {
    res.status(400).json({ success: false, message: "No file provided." });
    return;
  }

  await Lead.updateOne({ _id: id }, { filePath });

  const rows = await parseCSV(filePath as string, true);

  const headers = rows.headers; // Get CSV headers
  const row = Object.values(rows.row); // Get first row

  res.status(200).json({ success: true, filePath, headers, firstRow: row });
};

export const fetchSingleRow = async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id) {
    throw new ApiError("Invalid request.", 400);
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new ApiError("Lead not found.", 400);
  }
  const filePath = lead.filePath;
  if (!fs.existsSync(filePath as string)) {
    throw new ApiError("File not found.", 400);
  }

  try {
    const rows = await parseCSV(filePath as string, true);
    console.log({ rows });

    const headers = rows.headers; // Get CSV headers
    const row = rows.row; // Get first row

    res.status(200).json({ success: true, headers, row });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error processing CSV." });
  }
};

export const createLeadItems = async (req: Request, res: Response) => {
  const { id, header, title } = req.body;
  console.log({ id, header, title });
  if (!id || !header || !title) {
    throw new ApiError("Invalid request", 400);
  }
  console.log({ id, header });

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new ApiError("Lead not found.", 400);
  }

  const filePath = lead.filePath;
  if (!fs.existsSync(filePath as string)) {
    throw new ApiError("File not found.", 400);
  }

  const keys = (header as string[]).map((k: string) => k.toLowerCase().trim());

  let leadsResult;
  try {
    leadsResult = await parseCSV(filePath!);
    // console.log({ leadsResult });

    // update to have leads with only the keys that user selected in the frontend
    const formattedLead = leadsResult
      .map((obj: any) => {
        return Object.keys(obj)
          .filter((key) => keys.includes(key.toLowerCase().trim()))
          .reduce((acc, key) => {
            acc[key.toLowerCase().trim()] = obj[key].trim();
            acc["leadId"] = id;
            return acc;
          }, {} as Record<string, any>);
      })
      .filter((f: any) => Object.keys(f).length !== 0);
    // console.log({ formattedLead });

    await Lead.updateOne(
      { _id: id },
      { filePath: null, processed: true, title }
    );
    // save individual rows
    await LeadItem.insertMany(formattedLead);
  } catch (error) {
    throw new ApiError("Error while reading the file", 500);
  } finally {
    console.log({ filePathelete: filePath });
    // delete the file from server once the leads are saved
    await deleteFile(filePath as string);
  }
  res.status(201).json({ success: true, message: "Leads added successfully." });
};
