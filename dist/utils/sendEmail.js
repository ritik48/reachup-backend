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
exports.sendEmail = sendEmail;
const EmailJob_1 = require("../models/EmailJob");
const emailProvider_1 = require("../models/emailProvider");
const leadItem_1 = require("../models/leadItem");
const nodemailerTransport_1 = require("./nodemailerTransport");
const EMAIL_TEMPLATES = {
    1: { name: "Introduction Email", subject: "Nice to meet {{email}}" },
    2: {
        name: "Follow-up Email",
        subject: "hey {{email}}, Following up on our conversation {{name}}",
    },
};
function sendEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ jobId, leadItemId, templateId, senderEmailId, }) {
        var _b;
        try {
            const job = yield EmailJob_1.EmailJob.findById(jobId);
            if (!job || job.status !== "scheduled")
                return;
            const leadItem = yield leadItem_1.LeadItem.findById(leadItemId);
            const template = {
                content: "hello {{name}} {{email}}",
                subject: EMAIL_TEMPLATES[templateId],
            };
            if (!leadItem || !template) {
                throw new Error("Lead item or template not found");
            }
            const provider = yield emailProvider_1.EmailProvider.findById(senderEmailId);
            // Personalize email content
            const personalizedContent = template.content
                .replace(/{{name}}/g, (_b = leadItem.name) !== null && _b !== void 0 ? _b : "")
                .replace(/{{email}}/g, leadItem.email);
            const mailOptions = {
                from: provider.email,
                to: leadItem.email,
                subject: template.subject,
                html: personalizedContent,
            };
            console.log({ mailOptions });
            // Send email
            const transporter = (0, nodemailerTransport_1.nodemailerTransport)(provider.host, provider.port, provider.email, provider.password);
            const info = yield transporter.sendMail(mailOptions);
            job.status = "sent";
            job.sentTime = new Date();
            yield job.save();
            return info;
        }
        catch (error) {
            const job = yield EmailJob_1.EmailJob.findById(jobId);
            if (!job) {
                console.error("Job not found");
            }
            yield EmailJob_1.EmailJob.updateOne({ _id: jobId }, { status: "failed" });
        }
    });
}
