import Agenda from "agenda";
import { sendEmail } from "./sendEmail";
import { configDotenv } from "dotenv";



const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/futureblink",
    collection: "agendaJobs",
  },
  processEvery: "30 seconds",
});

// Define email job
agenda.define("send workflow email", async (job: any) => {
  const { jobId, leadItemId, templateId, senderEmailId } = job.attrs.data;
  await sendEmail({ jobId, leadItemId, templateId, senderEmailId });
});

export { agenda };
