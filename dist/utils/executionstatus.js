"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executionstatus = void 0;
const EmailJob_1 = require("../models/EmailJob");
const WorfklowExecution_1 = require("../models/WorfklowExecution");
const ApiError_1 = require("./ApiError");
const executionstatus = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const executions = yield WorfklowExecution_1.WorkflowExecution.find({ workflow: id })
        .sort({ createdAt: -1 })
        .populate("workflow")
        .populate("leadSource");
    if (!executions) {
        throw new ApiError_1.ApiError("Execution not found", 404);
    }
    const allStatus = [];
    for (let execution of executions) {
        const emailJobs = yield EmailJob_1.EmailJob.find({ execution: execution._id });
        const status = {
            stats: {
                scheduled: emailJobs.filter((j) => j.status === "scheduled").length,
                sent: emailJobs.filter((j) => j.status === "sent").length,
                failed: emailJobs.filter((j) => j.status === "failed").length,
                createdAt: execution.createdAt,
            },
        };
        allStatus.push(status);
    }
    return allStatus;
});
exports.executionstatus = executionstatus;
