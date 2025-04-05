"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowRoute = void 0;
const express_1 = __importDefault(require("express"));
const AsyncHandler_1 = require("../utils/AsyncHandler");
const auth_1 = require("../utils/auth");
const workflow_controllers_1 = require("../controllers/workflow.controllers");
const workflowRoute = express_1.default.Router();
exports.workflowRoute = workflowRoute;
workflowRoute.post("/", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(workflow_controllers_1.createWorkflow));
workflowRoute.post("/:id/execute", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(workflow_controllers_1.executeWorkflow));
workflowRoute.get("/", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(workflow_controllers_1.fetchAllWorkflow));
workflowRoute.get("/:id", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(workflow_controllers_1.fetchWorkflow));
workflowRoute.delete("/:id", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(workflow_controllers_1.deleteWorkflow));
workflowRoute.patch("/:id", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(workflow_controllers_1.editWorkflow));
workflowRoute.get("/:id/status", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(workflow_controllers_1.fetchExecutionstatus));
