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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agenda = void 0;
const agenda_1 = __importDefault(require("agenda"));
const sendEmail_1 = require("./sendEmail");
const agenda = new agenda_1.default({
    db: {
        address: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/futureblink",
        collection: "agendaJobs",
    },
    processEvery: "30 seconds",
});
exports.agenda = agenda;
// Define email job
agenda.define("send workflow email", (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId, leadItemId, templateId, senderEmailId } = job.attrs.data;
    yield (0, sendEmail_1.sendEmail)({ jobId, leadItemId, templateId, senderEmailId });
}));
