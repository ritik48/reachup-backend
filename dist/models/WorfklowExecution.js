"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecution = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const executionSchema = new mongoose_1.default.Schema({
    workflow: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Workflow" },
    leadSource: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Lead" },
    status: {
        type: String,
        enum: ["running", "completed", "failed"],
        default: "running",
    },
    totalLeads: Number,
    processedLeads: { type: Number, default: 0 },
    failedLeads: { type: Number, default: 0 },
    startTime: Date,
    endTime: Date,
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
});
// Create and export the Mongoose model
const WorkflowExecution = mongoose_1.default.model("WorkflowExecution", executionSchema);
exports.WorkflowExecution = WorkflowExecution;
