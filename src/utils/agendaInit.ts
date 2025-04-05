import Agenda from "agenda";
import { sendEmail } from "./sendEmail";

const agenda = new Agenda({
  db: {
    address: "mongodb://127.0.0.1:27017/futureblink",
    collection: "agendaJobs",
  },
  processEvery: "30 seconds",
});

// Define email job
agenda.define("send workflow email", async (job: any) => {
  const { jobId, leadItemId, templateId, senderEmailId } = job.attrs.data;
  console.log({ jobbbbbbbbbb: job });
  await sendEmail({ jobId, leadItemId, templateId, senderEmailId });
});

// Start agenda when DB is connected
async function startAgenda() {
  await agenda.start();
  console.log("Agenda started");
}

// Graceful shutdown
async function gracefulShutdown() {
  await agenda.stop();
  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export { agenda };
