import { EmailJob } from "../models/EmailJob";
import { WorkflowExecution } from "../models/WorfklowExecution";
import { ApiError } from "./ApiError";

export const executionstatus = async (id: string) => {
  const executions = await WorkflowExecution.find({ workflow: id })
    .sort({ createdAt: -1 })
    .populate("workflow")
    .populate("leadSource");

  if (!executions) {
    throw new ApiError("Execution not found", 404);
  }

  const allStatus = [];

  for (let execution of executions) {
    const emailJobs = await EmailJob.find({ execution: execution._id });

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
};
