"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailJob = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const emailJobSchema = new mongoose_1.default.Schema({
    execution: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "WorkflowExecution" },
    workflow: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Workflow" },
    leadItem: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "LeadItem" },
    status: {
        type: String,
        enum: ["scheduled", "sent", "failed"],
        default: "scheduled",
    },
    scheduledTime: Date,
    sentTime: Date,
    delayDuration: Number, // in minutes
    error: String,
    retryCount: { type: Number, default: 0 },
});
const EmailJob = mongoose_1.default.model("EmailJob", emailJobSchema);
exports.EmailJob = EmailJob;
