"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadsRoute = void 0;
const express_1 = __importDefault(require("express"));
const AsyncHandler_1 = require("../utils/AsyncHandler");
const auth_1 = require("../utils/auth");
const leads_controllers_1 = require("../controllers/leads.controllers");
const file_handler_1 = require("../utils/file-handler");
const leadsRoute = express_1.default.Router();
exports.leadsRoute = leadsRoute;
leadsRoute.post("/create", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(leads_controllers_1.createLead));
leadsRoute.post("/upload-lead", auth_1.isAuthenticated, file_handler_1.upload.single("file"), (0, AsyncHandler_1.asyncHandler)(leads_controllers_1.uploadFile));
leadsRoute.get("/single-row", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(leads_controllers_1.fetchSingleRow));
leadsRoute.post("/lead-items", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(leads_controllers_1.createLeadItems));
leadsRoute.get("/", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(leads_controllers_1.fetchLeads));
leadsRoute.get("/items/:id", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(leads_controllers_1.fetchLeadItems));
leadsRoute.get("/:id", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(leads_controllers_1.fetchLead));
leadsRoute.delete("/:id", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(leads_controllers_1.deleteLeads));
leadsRoute.patch("/:id", auth_1.isAuthenticated, (0, AsyncHandler_1.asyncHandler)(leads_controllers_1.updateLeads));
