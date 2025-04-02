import express, { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { isAuthenticated } from "../utils/auth";
import {
  createLeads,
  deleteLeads,
  fetchLeadItems,
  fetchLeads,
  updateLeads,
} from "../controllers/leads.controllers";
import { upload } from "../utils/file-handler";

const leadsRoute = express.Router();

leadsRoute.post(
  "/",
  isAuthenticated,
  upload.single("file"),
  asyncHandler(createLeads)
);
leadsRoute.get("/", isAuthenticated, asyncHandler(fetchLeads));
leadsRoute.get("/items/:id", isAuthenticated, asyncHandler(fetchLeadItems));
leadsRoute.delete("/:id", isAuthenticated, asyncHandler(deleteLeads));
leadsRoute.patch("/:id", isAuthenticated, asyncHandler(updateLeads));

export { leadsRoute };
