import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import { ApiError } from "../utils/ApiError";
import { generateAccessToken } from "../utils/auth";
import { Lead } from "../models/lead";

import fs from "fs";
import csvParser from "csv-parser";
import { deleteFile, parseCSV } from "../utils/file-handler";
import { LeadItem } from "../models/leadItem";
import { Workflow } from "../models/workflow";
import { WorkflowExecution } from "../models/WorfklowExecution";
import { IExecutionSchema, ILeadItem, IWorkflow } from "../types";
import { EmailJob } from "../models/EmailJob";
import { agenda } from "../utils/agendaInit";
import { executionstatus } from "../utils/executionstatus";

function validateWorkflow(nodes: any[], edges: any[]) {
  // Check we have at least one lead node and one email node
  const hasLeadNode = nodes.some((n) => n.type === "leadNode");
  const hasEmailNode = nodes.some((n) => n.type === "emailNode");

  if (!hasLeadNode || !hasEmailNode) return false;

  // Check all delay nodes are connected to exactly one email node
  const delayNodes = nodes.filter((n) => n.type === "delayNode");
  for (const delayNode of delayNodes) {
    const outgoingEdges = edges.filter((e) => e.source === delayNode.id);
    if (outgoingEdges.length !== 1) return false;

    const targetNode = nodes.find((n) => n.id === outgoingEdges[0].target);
    if (targetNode.type !== "emailNode") return false;
  }

  return true;
}
export const fetchWorkflow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  if (!id) {
    throw new ApiError("Invalid request", 400);
  }
  const workflow = await Workflow.findById(id);

  if (!workflow) {
    throw new ApiError("Workflow not found", 404);
  }
  res.status(201).json({ success: true, data: workflow });
};

export const deleteWorkflow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  if (!id) {
    throw new ApiError("Invalid request", 400);
  }
  const workflow = await Workflow.findById(id);

  if (!workflow) {
    throw new ApiError("Workflow not found", 404);
  }

  await Workflow.deleteOne({ _id: id });
  await WorkflowExecution.deleteMany({ workflow: id });
  await EmailJob.deleteMany({ workflow: id });

  res.status(201).json({ success: true, data: workflow });
};

export const editWorkflow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { id } = req.params;
  if (!id) {
    throw new ApiError("Invalid request", 400);
  }
  const workflow = await Workflow.findById(id);

  if (!workflow) {
    throw new ApiError("Workflow not found", 404);
  }

  const { name } = req.body;

  if (!name) {
    throw new ApiError("Invalid request.", 404);
  }

  await Workflow.updateOne({ _id: id }, { name });

  res.status(201).json({ success: true, message: "Workflow edited" });
};

export const fetchAllWorkflow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const workflows = await Workflow.find({ createdBy: req.user!._id });
  const finalData = [];

  for (let workflow of workflows) {
    const allStatus = await executionstatus(workflow._id.toString());
    const workflowjson = workflow.toObject();
    finalData.push({ ...workflowjson, stats: allStatus });
  }

  res.status(201).json({ success: true, data: finalData });
};

export const createWorkflow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { name, emailProvider } = req.body;
  console.log({ name, emailProvider });

  const workflow = new Workflow({
    name,
    createdBy: req.user!._id,
    emailProvider,
  });

  await workflow.save();
  res
    .status(201)
    .json({ success: true, message: "Workflow created.", data: workflow });
};

export const executeWorkflow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.id) {
    throw new ApiError("Workflow id missing.", 400);
  }

  // check if we already have unfinished schedule

  const currentExecution = await WorkflowExecution.find({
    workflow: req.params.id,
  }).sort({ createdAt: -1 });

  if (currentExecution.length > 0) {
    const emailJobs = await EmailJob.find({
      execution: currentExecution[0]._id,
    });

    const status = {
      hasPending: emailJobs.some((j) => j.status === "scheduled"),
      allFailed:
        emailJobs.length > 0 && emailJobs.every((j) => j.status === "failed"),
      allSent:
        emailJobs.length > 0 && emailJobs.every((j) => j.status === "sent"),
    };

    if (status.hasPending) {
      throw new ApiError(
        "You already have an incomplete workflow under execution. Please wait.",
        400
      );
    }
  }

  let { nodes, edges } = req.body;

  // Validate the workflow structure
  if (!validateWorkflow(JSON.parse(nodes || "[]"), JSON.parse(edges || "[]"))) {
    res.status(400).json({ error: "Invalid workflow structure" });
    return;
  }
  await Workflow.updateOne(
    { _id: req.params.id },
    { nodes, edges, active: true }
  );

  nodes = JSON.parse(nodes || "[]");
  edges = JSON.parse(edges || "[]");

  console.log({ nodes, edges });

  const workflow = await Workflow.findById(req.params.id);
  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }

  nodes = JSON.parse(workflow.nodes || "[]");

  // Find all lead nodes in the workflow
  const leadNodes = nodes.filter((n: any) => n.type === "leadNode");
  if (leadNodes.length === 0) {
    res.status(400).json({ error: "Workflow contains no lead nodes" });
    return;
  }
  console.log({ leadNodes });

  // Get all unique lead source IDs from the workflow's lead nodes
  const leadSourceIds = [
    ...new Set(leadNodes.map((node: any) => node.data.config.lead._id)),
  ];
  console.log({ leadSourceIds });

  // Find all lead items from any of these lead sources
  const leadItems = await LeadItem.find({
    leadId: { $in: leadSourceIds },
  });

  if (leadItems.length === 0) {
    res.status(400).json({
      error: "No lead items found for any lead sources in this workflow",
    });
    return;
  }

  // Create execution record
  const execution = new WorkflowExecution({
    workflow: workflow._id,
    leadSources: leadSourceIds, // Now tracks multiple lead sources
    totalLeads: leadItems.length,
    createdBy: req.user!._id,
  });

  await execution.save();

  // Schedule all emails for all paths in the workflow
  await scheduleWorkflow(workflow, leadItems, execution);

  res
    .status(201)
    .json({ success: true, message: "Worflow scheduled", data: execution });
};

export const fetchExecutionstatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError("Invalid request", 400);
  }

  const allStatus = await executionstatus(id);

  res
    .status(200)
    .json({ success: true, message: "Status fetched", data: allStatus });
};

async function scheduleWorkflow(
  workflow: IWorkflow,
  leadItems: ILeadItem[],
  execution: IExecutionSchema
) {
  // Group lead items by their lead source ID
  const leadItemsBySource: any = {};
  leadItems.forEach((item) => {
    const _id = item.leadId.toString();
    if (!leadItemsBySource[_id]) {
      leadItemsBySource[_id] = [];
    }
    leadItemsBySource[_id].push(item);
  });

  const nodes: any[] = JSON.parse(workflow.nodes || "[]");

  const leadNodes = nodes.filter((n) => n.type === "leadNode");
  for (const leadNode of leadNodes) {
    const leadSourceId = leadNode.data.config.lead._id;
    const itemsForThisSource = leadItemsBySource[leadSourceId] || [];

    // Find the path starting from this lead node
    const path = findPathFromNode(workflow, leadNode.id);

    // Schedule emails for each lead item in this path
    for (const leadItem of itemsForThisSource) {
      await scheduleForLeadItem(workflow, leadItem, path, execution);
    }
  }
}

// Helper to find path from any node
function findPathFromNode(workflow: IWorkflow, startNodeId: string) {
  const path = [];
  let currentNodeId = startNodeId;

  const edges: any[] = JSON.parse(workflow.edges || "[]");

  while (currentNodeId) {
    path.push(currentNodeId);
    const edge = edges.find((e) => e.source === currentNodeId);
    if (!edge) break;
    currentNodeId = edge.target;
  }

  return path;
}

// Updated scheduling for a single lead item
async function scheduleForLeadItem(
  workflow: IWorkflow,
  leadItem: ILeadItem,
  path: string[],
  execution: IExecutionSchema
) {
  let currentDelay = 0; // in minutes
  const nodes: any[] = JSON.parse(workflow.nodes || "[]");
  for (const nodeId of path) {
    const node = nodes.find((n) => n.id === nodeId);

    if (node.type === "delayNode") {
      currentDelay += node.data.config.delayTime;
    } else if (node.type === "emailNode") {
      const job = new EmailJob({
        execution: execution._id,
        leadItem: leadItem._id,
        // emailTemplate: node.data.config.template,
        status: "scheduled",
        scheduledTime: new Date(Date.now() + currentDelay * 60000),
        delayDuration: currentDelay,
        workflow: execution.workflow,
      });

      await job.save();

      await agenda.schedule(
        new Date(Date.now() + currentDelay * 60000),
        "send workflow email",
        {
          jobId: job._id,
          leadItemId: leadItem._id,
          templateId: "node.config.template",
          senderEmailId: workflow.emailProvider,
        }
      );
    }
  }
}
