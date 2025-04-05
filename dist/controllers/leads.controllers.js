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
exports.createLeadItems = exports.fetchSingleRow = exports.uploadFile = exports.createLead = exports.deleteLeadItems = exports.fetchLeadItems = exports.deleteLeads = exports.updateLeads = exports.fetchLead = exports.fetchLeads = void 0;
const ApiError_1 = require("../utils/ApiError");
const lead_1 = require("../models/lead");
const fs_1 = __importDefault(require("fs"));
const file_handler_1 = require("../utils/file-handler");
const leadItem_1 = require("../models/leadItem");
const fetchLeads = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Get all leads for the user
        const leads = yield lead_1.Lead.find({ user: userId });
        // For each lead, count the number of LeadItems that reference it
        const leadsWithItemCounts = yield Promise.all(leads.map((lead) => __awaiter(void 0, void 0, void 0, function* () {
            const totalItems = yield leadItem_1.LeadItem.countDocuments({ leadId: lead._id });
            return Object.assign(Object.assign({}, lead.toObject()), { total: totalItems });
        })));
        res.status(200).json({ success: true, data: leadsWithItemCounts });
    }
    catch (error) {
        next(error);
    }
});
exports.fetchLeads = fetchLeads;
const fetchLead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = yield lead_1.Lead.find({ _id: id });
    res.status(200).json({ success: true, data });
});
exports.fetchLead = fetchLead;
const updateLeads = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title } = req.body;
    if (!id) {
        throw new ApiError_1.ApiError("Invalid request", 400);
    }
    const lead = yield lead_1.Lead.findById(id);
    if (!lead)
        throw new ApiError_1.ApiError("Lead not found.", 400);
    yield lead_1.Lead.updateOne({ _id: id }, { title });
    res.status(201).json({ success: true, message: "Lead updated successfully" });
});
exports.updateLeads = updateLeads;
const deleteLeads = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        throw new ApiError_1.ApiError("Invalid request", 400);
    const lead = yield lead_1.Lead.findById(id);
    if (!lead)
        throw new ApiError_1.ApiError("Lead not found.", 400);
    yield lead_1.Lead.deleteOne({ _id: id });
    yield leadItem_1.LeadItem.deleteMany({ leadId: id });
    res.status(201).json({ success: true, message: "Lead deleted successfully" });
});
exports.deleteLeads = deleteLeads;
const fetchLeadItems = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!id)
        throw new ApiError_1.ApiError("Invalid request", 400);
    const lead = yield lead_1.Lead.findById(id);
    if (!id)
        throw new ApiError_1.ApiError("Lead not found.", 400);
    const data = yield leadItem_1.LeadItem.find({ leadId: id });
    res.status(200).json({
        success: true,
        data: { title: lead === null || lead === void 0 ? void 0 : lead.title, leads: data, processed: lead === null || lead === void 0 ? void 0 : lead.processed },
    });
});
exports.fetchLeadItems = fetchLeadItems;
const deleteLeadItems = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        throw new ApiError_1.ApiError("Invalid request", 400);
    const lead = yield leadItem_1.LeadItem.findById(id);
    if (!lead)
        throw new ApiError_1.ApiError("Not found.", 400);
    yield leadItem_1.LeadItem.deleteOne({ _id: id });
    res.status(201).json({ success: true, message: "Row deleted successfully" });
});
exports.deleteLeadItems = deleteLeadItems;
const createLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title } = req.body;
    if (!title)
        throw new ApiError_1.ApiError("Invalid request", 400);
    const newLead = yield lead_1.Lead.create({ title, user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
    res.status(201).json({
        success: true,
        id: newLead._id,
        message: "Lead created successfully",
    });
});
exports.createLead = createLead;
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const { id } = req.body;
    if (!filePath || !id) {
        res.status(400).json({ success: false, message: "No file provided." });
        return;
    }
    yield lead_1.Lead.updateOne({ _id: id }, { filePath });
    const rows = yield (0, file_handler_1.parseCSV)(filePath, true);
    const headers = rows.headers; // Get CSV headers
    const row = Object.values(rows.row); // Get first row
    res.status(200).json({ success: true, filePath, headers, firstRow: row });
});
exports.uploadFile = uploadFile;
const fetchSingleRow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    if (!id) {
        throw new ApiError_1.ApiError("Invalid request.", 400);
    }
    const lead = yield lead_1.Lead.findById(id);
    if (!lead) {
        throw new ApiError_1.ApiError("Lead not found.", 400);
    }
    const filePath = lead.filePath;
    if (!fs_1.default.existsSync(filePath)) {
        throw new ApiError_1.ApiError("File not found.", 400);
    }
    try {
        const rows = yield (0, file_handler_1.parseCSV)(filePath, true);
        console.log({ rows });
        const headers = rows.headers; // Get CSV headers
        const row = rows.row; // Get first row
        res.status(200).json({ success: true, headers, row });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error processing CSV." });
    }
});
exports.fetchSingleRow = fetchSingleRow;
const createLeadItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, header, title } = req.body;
    console.log({ id, header, title });
    if (!id || !header || !title) {
        throw new ApiError_1.ApiError("Invalid request", 400);
    }
    console.log({ id, header });
    const lead = yield lead_1.Lead.findById(id);
    if (!lead) {
        throw new ApiError_1.ApiError("Lead not found.", 400);
    }
    const filePath = lead.filePath;
    if (!fs_1.default.existsSync(filePath)) {
        throw new ApiError_1.ApiError("File not found.", 400);
    }
    const keys = header.map((k) => k.toLowerCase().trim());
    let leadsResult;
    try {
        leadsResult = yield (0, file_handler_1.parseCSV)(filePath);
        // console.log({ leadsResult });
        // update to have leads with only the keys that user selected in the frontend
        const formattedLead = leadsResult
            .map((obj) => {
            return Object.keys(obj)
                .filter((key) => keys.includes(key.toLowerCase().trim()))
                .reduce((acc, key) => {
                acc[key.toLowerCase().trim()] = obj[key].trim();
                acc["leadId"] = id;
                return acc;
            }, {});
        })
            .filter((f) => Object.keys(f).length !== 0);
        // console.log({ formattedLead });
        yield lead_1.Lead.updateOne({ _id: id }, { filePath: null, processed: true, title });
        // save individual rows
        yield leadItem_1.LeadItem.insertMany(formattedLead);
    }
    catch (error) {
        throw new ApiError_1.ApiError("Error while reading the file", 500);
    }
    finally {
        console.log({ filePathelete: filePath });
        // delete the file from server once the leads are saved
        yield (0, file_handler_1.deleteFile)(filePath);
    }
    res.status(201).json({ success: true, message: "Leads added successfully." });
});
exports.createLeadItems = createLeadItems;
