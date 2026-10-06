"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInquiry = exports.updateInquiry = exports.createInquiry = exports.getInquiryById = exports.getInquiries = void 0;
const inquiryService_1 = __importDefault(require("../services/inquiryService"));
const responseHelper_1 = require("../helpers/responseHelper");
const getInquiries = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const inquiries = await inquiryService_1.default.getAllInquiries(filter);
        (0, responseHelper_1.sendSuccess)(res, inquiries, 'Inquiries fetched successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.getInquiries = getInquiries;
const getInquiryById = async (req, res) => {
    try {
        const inquiry = await inquiryService_1.default.getInquiryById(req.params.id);
        if (!inquiry) {
            (0, responseHelper_1.sendError)(res, 'Inquiry not found', 404);
            return;
        }
        (0, responseHelper_1.sendSuccess)(res, inquiry, 'Inquiry fetched successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.getInquiryById = getInquiryById;
const createInquiry = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) {
            (0, responseHelper_1.sendError)(res, 'Name, email, and message are required fields', 400);
            return;
        }
        const payload = {
            name: name.trim(),
            email: email.trim(),
            phone: phone ? phone.trim() : '',
            message: message.trim(),
            status: 'Pending',
        };
        const inquiry = await inquiryService_1.default.createInquiry(payload);
        (0, responseHelper_1.sendSuccess)(res, inquiry, 'Inquiry submitted successfully', 201);
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 400);
    }
};
exports.createInquiry = createInquiry;
const updateInquiry = async (req, res) => {
    try {
        const { name, email, phone, message, status } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name.trim();
        if (email !== undefined)
            updateData.email = email.trim();
        if (phone !== undefined)
            updateData.phone = phone.trim();
        if (message !== undefined)
            updateData.message = message.trim();
        if (status !== undefined)
            updateData.status = status;
        const inquiry = await inquiryService_1.default.updateInquiry(req.params.id, updateData);
        if (!inquiry) {
            (0, responseHelper_1.sendError)(res, 'Inquiry not found', 404);
            return;
        }
        (0, responseHelper_1.sendSuccess)(res, inquiry, 'Inquiry updated successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 400);
    }
};
exports.updateInquiry = updateInquiry;
const deleteInquiry = async (req, res) => {
    try {
        const inquiry = await inquiryService_1.default.deleteInquiry(req.params.id);
        if (!inquiry) {
            (0, responseHelper_1.sendError)(res, 'Inquiry not found', 404);
            return;
        }
        (0, responseHelper_1.sendSuccess)(res, null, 'Inquiry deleted successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.deleteInquiry = deleteInquiry;
