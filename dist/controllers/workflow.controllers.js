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
exports.fetchExecutionstatus = exports.executeWorkflow = exports.createWorkflow = exports.fetchAllWorkflow = exports.editWorkflow = exports.deleteWorkflow = exports.fetchWorkflow = void 0;
const ApiError_1 = require("../utils/ApiError");
const leadItem_1 = require("../models/leadItem");
const workflow_1 = require("../models/workflow");
const WorfklowExecution_1 = require("../models/WorfklowExecution");
const EmailJob_1 = require("../models/EmailJob");
const agendaInit_1 = require("../utils/agendaInit");
const executionstatus_1 = require("../utils/executionstatus");
function validateWorkflow(nodes, edges) {
    // Check we have at least one lead node and one email node
    const hasLeadNode = nodes.some((n) => n.type === "leadNode");
    const hasEmailNode = nodes.some((n) => n.type === "emailNode");
    if (!hasLeadNode || !hasEmailNode)
        return false;
    // Check all delay nodes are connected to exactly one email node
    const delayNodes = nodes.filter((n) => n.type === "delayNode");
    for (const delayNode of delayNodes) {
        const outgoingEdges = edges.filter((e) => e.source === delayNode.id);
        if (outgoingEdges.length !== 1)
            return false;
        const targetNode = nodes.find((n) => n.id === outgoingEdges[0].target);
        if (targetNode.type !== "emailNode")
            return false;
    }
    return true;
}
const fetchWorkflow = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.params;
    if (!id) {
        throw new ApiError_1.ApiError("Invalid request", 400);
    }
    const workflow = yield workflow_1.Workflow.findById(id);
    if (!workflow) {
        throw new ApiError_1.ApiError("Workflow not found", 404);
    }
    res.status(201).json({ success: true, data: workflow });
});
exports.fetchWorkflow = fetchWorkflow;
const deleteWorkflow = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.params;
    if (!id) {
        throw new ApiError_1.ApiError("Invalid request", 400);
    }
    const workflow = yield workflow_1.Workflow.findById(id);
    if (!workflow) {
        throw new ApiError_1.ApiError("Workflow not found", 404);
    }
    yield workflow_1.Workflow.deleteOne({ _id: id });
    yield WorfklowExecution_1.WorkflowExecution.deleteMany({ workflow: id });
    yield EmailJob_1.EmailJob.deleteMany({ workflow: id });
    res.status(201).json({ success: true, data: workflow });
});
exports.deleteWorkflow = deleteWorkflow;
const editWorkflow = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.params;
    if (!id) {
        throw new ApiError_1.ApiError("Invalid request", 400);
    }
    const workflow = yield workflow_1.Workflow.findById(id);
    if (!workflow) {
        throw new ApiError_1.ApiError("Workflow not found", 404);
    }
    const { name } = req.body;
    if (!name) {
        throw new ApiError_1.ApiError("Invalid request.", 404);
    }
    yield workflow_1.Workflow.updateOne({ _id: id }, { name });
    res.status(201).json({ success: true, message: "Workflow edited" });
});
exports.editWorkflow = editWorkflow;
const fetchAllWorkflow = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const workflows = yield workflow_1.Workflow.find({ createdBy: req.user._id });
    const finalData = [];
    for (let workflow of workflows) {
        const allStatus = yield (0, executionstatus_1.executionstatus)(workflow._id.toString());
        const workflowjson = workflow.toObject();
        finalData.push(Object.assign(Object.assign({}, workflowjson), { stats: allStatus }));
    }
    res.status(201).json({ success: true, data: finalData });
});
exports.fetchAllWorkflow = fetchAllWorkflow;
const createWorkflow = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { name, emailProvider } = req.body;
    const workflow = new workflow_1.Workflow({
        name,
        createdBy: req.user._id,
        emailProvider,
    });
    yield workflow.save();
    res
        .status(201)
        .json({ success: true, message: "Workflow created.", data: workflow });
});
exports.createWorkflow = createWorkflow;
const executeWorkflow = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        throw new ApiError_1.ApiError("Workflow id missing.", 400);
    }
    // check if we already have unfinished schedule
    const currentExecution = yield WorfklowExecution_1.WorkflowExecution.find({
        workflow: req.params.id,
    }).sort({ createdAt: -1 });
    if (currentExecution.length > 0) {
        const emailJobs = yield EmailJob_1.EmailJob.find({
            execution: currentExecution[0]._id,
        });
        const status = {
            hasPending: emailJobs.some((j) => j.status === "scheduled"),
            allFailed: emailJobs.length > 0 && emailJobs.every((j) => j.status === "failed"),
            allSent: emailJobs.length > 0 && emailJobs.every((j) => j.status === "sent"),
        };
        if (status.hasPending) {
            throw new ApiError_1.ApiError("You already have an incomplete workflow under execution. Please wait.", 400);
        }
    }
    let { nodes, edges } = req.body;
    // Validate the workflow structure
    if (!validateWorkflow(JSON.parse(nodes || "[]"), JSON.parse(edges || "[]"))) {
        res.status(400).json({ error: "Invalid workflow structure" });
        return;
    }
    yield workflow_1.Workflow.updateOne({ _id: req.params.id }, { nodes, edges, active: true });
    nodes = JSON.parse(nodes || "[]");
    edges = JSON.parse(edges || "[]");
    const workflow = yield workflow_1.Workflow.findById(req.params.id);
    if (!workflow) {
        res.status(404).json({ error: "Workflow not found" });
        return;
    }
    nodes = JSON.parse(workflow.nodes || "[]");
    // Find all lead nodes in the workflow
    const leadNodes = nodes.filter((n) => n.type === "leadNode");
    if (leadNodes.length === 0) {
        res.status(400).json({ error: "Workflow contains no lead nodes" });
        return;
    }
    // Get all unique lead source IDs from the workflow's lead nodes
    const leadSourceIds = [
        ...new Set(leadNodes.map((node) => node.data.config.lead._id)),
    ];
    // Find all lead items from any of these lead sources
    const leadItems = yield leadItem_1.LeadItem.find({
        leadId: { $in: leadSourceIds },
    });
    if (leadItems.length === 0) {
        res.status(400).json({
            error: "No lead items found for any lead sources in this workflow",
        });
        return;
    }
    // Create execution record
    const execution = new WorfklowExecution_1.WorkflowExecution({
        workflow: workflow._id,
        leadSources: leadSourceIds, // Now tracks multiple lead sources
        totalLeads: leadItems.length,
        createdBy: req.user._id,
    });
    yield execution.save();
    // Schedule all emails for all paths in the workflow
    yield scheduleWorkflow(workflow, leadItems, execution);
    res
        .status(201)
        .json({ success: true, message: "Worflow scheduled", data: execution });
});
exports.executeWorkflow = executeWorkflow;
const fetchExecutionstatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        throw new ApiError_1.ApiError("Invalid request", 400);
    }
    const allStatus = yield (0, executionstatus_1.executionstatus)(id);
    res
        .status(200)
        .json({ success: true, message: "Status fetched", data: allStatus });
});
exports.fetchExecutionstatus = fetchExecutionstatus;
function scheduleWorkflow(workflow, leadItems, execution) {
    return __awaiter(this, void 0, void 0, function* () {
        // Group lead items by their lead source ID
        const leadItemsBySource = {};
        leadItems.forEach((item) => {
            const _id = item.leadId.toString();
            if (!leadItemsBySource[_id]) {
                leadItemsBySource[_id] = [];
            }
            leadItemsBySource[_id].push(item);
        });
        const nodes = JSON.parse(workflow.nodes || "[]");
        const leadNodes = nodes.filter((n) => n.type === "leadNode");
        for (const leadNode of leadNodes) {
            const leadSourceId = leadNode.data.config.lead._id;
            const itemsForThisSource = leadItemsBySource[leadSourceId] || [];
            // Find the path starting from this lead node
            const path = findPathFromNode(workflow, leadNode.id);
            // Schedule emails for each lead item in this path
            for (const leadItem of itemsForThisSource) {
                yield scheduleForLeadItem(workflow, leadItem, path, execution);
            }
        }
    });
}
// Helper to find path from any node
function findPathFromNode(workflow, startNodeId) {
    const path = [];
    let currentNodeId = startNodeId;
    const edges = JSON.parse(workflow.edges || "[]");
    while (currentNodeId) {
        path.push(currentNodeId);
        const edge = edges.find((e) => e.source === currentNodeId);
        if (!edge)
            break;
        currentNodeId = edge.target;
    }
    return path;
}
// Updated scheduling for a single lead item
function scheduleForLeadItem(workflow, leadItem, path, execution) {
    return __awaiter(this, void 0, void 0, function* () {
        let currentDelay = 0; // in minutes
        const nodes = JSON.parse(workflow.nodes || "[]");
        for (const nodeId of path) {
            const node = nodes.find((n) => n.id === nodeId);
            if (node.type === "delayNode") {
                currentDelay += node.data.config.delayTime;
            }
            else if (node.type === "emailNode") {
                const job = new EmailJob_1.EmailJob({
                    execution: execution._id,
                    leadItem: leadItem._id,
                    status: "scheduled",
                    scheduledTime: new Date(Date.now() + currentDelay * 60000),
                    delayDuration: currentDelay,
                    workflow: execution.workflow,
                });
                yield job.save();
                yield agendaInit_1.agenda.schedule(new Date(Date.now() + currentDelay * 60000), "send workflow email", {
                    jobId: job._id,
                    leadItemId: leadItem._id,
                    templateId: node.data.config.template,
                    senderEmailId: workflow.emailProvider,
                });
            }
        }
    });
}
