import express, { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { isAuthenticated } from "../utils/auth";
import {
  createLead,
  createLeadItems,
  deleteLeads,
  fetchLead,
  fetchLeadItems,
  fetchLeads,
  fetchSingleRow,
  updateLeads,
  uploadFile,
} from "../controllers/leads.controllers";
import { upload } from "../utils/file-handler";

const leadsRoute = express.Router();

leadsRoute.post("/create", isAuthenticated, asyncHandler(createLead));
leadsRoute.post(
  "/upload-lead",
  isAuthenticated,
  upload.single("file"),
  asyncHandler(uploadFile)
);

leadsRoute.get("/single-row", isAuthenticated, asyncHandler(fetchSingleRow));
leadsRoute.post("/lead-items", isAuthenticated, asyncHandler(createLeadItems));

leadsRoute.get("/", isAuthenticated, asyncHandler(fetchLeads));
leadsRoute.get("/items/:id", isAuthenticated, asyncHandler(fetchLeadItems));
leadsRoute.get("/:id", isAuthenticated, asyncHandler(fetchLead));
leadsRoute.delete("/:id", isAuthenticated, asyncHandler(deleteLeads));
leadsRoute.patch("/:id", isAuthenticated, asyncHandler(updateLeads));

export { leadsRoute };
