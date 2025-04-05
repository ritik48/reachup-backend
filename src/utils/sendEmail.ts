import { EmailJob } from "../models/EmailJob";
import { EmailProvider } from "../models/emailProvider";
import { LeadItem } from "../models/leadItem";
import { nodemailerTransport } from "./nodemailerTransport";

export async function sendEmail({
  jobId,
  leadItemId,
  templateId,
  senderEmailId,
}: any) {
  try {
    console.log({ jobId, leadItemId, senderEmailId });
    const job = await EmailJob.findById(jobId);
    if (!job || job.status !== "scheduled") return;

    const leadItem = await LeadItem.findById(leadItemId);
    const template = { content: "hello {{name}} {{email}}", subject: "Test 1" };

    if (!leadItem || !template) {
      throw new Error("Lead item or template not found");
    }

    const provider = await EmailProvider.findById(senderEmailId);

    // Personalize email content
    const personalizedContent = template.content
      .replace(/{{name}}/g, leadItem.name ?? "")
      .replace(/{{email}}/g, leadItem.email);

    const mailOptions = {
      from: provider!.email,
      to: leadItem.email,
      subject: template.subject,
      html: personalizedContent,
    };

    console.log({ mailOptions });

    // Send email

    const transporter = nodemailerTransport(
      provider!.host,
      provider!.port,
      provider!.email,
      provider!.password
    );

    const info = await transporter.sendMail(mailOptions);

    // Update job status
    job.status = "sent";
    job.sentTime = new Date();
    await job.save();

    return info;
  } catch (error: any) {
    console.log({ error });
    // Update job with error
    const job = await EmailJob.findById(jobId);

    if (!job) {
      console.error("Job not found");
    }

    await EmailJob.updateOne({ _id: jobId }, { status: "failed" });
  }
}
