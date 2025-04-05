import express, { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { isAuthenticated } from "../utils/auth";
import {
  createWorkflow,
  executeWorkflow,
  fetchAllWorkflow,
  fetchExecutionstatus,
  fetchWorkflow,
} from "../controllers/workflow.controllers";

const workflowRoute = express.Router();

workflowRoute.post("/", isAuthenticated, asyncHandler(createWorkflow));
workflowRoute.post(
  "/:id/execute",
  isAuthenticated,
  asyncHandler(executeWorkflow)
);
workflowRoute.get("/", isAuthenticated, asyncHandler(fetchAllWorkflow));
workflowRoute.get("/:id", isAuthenticated, asyncHandler(fetchWorkflow));
workflowRoute.get(
  "/:id/status",
  isAuthenticated,
  asyncHandler(fetchExecutionstatus)
);

export { workflowRoute };
