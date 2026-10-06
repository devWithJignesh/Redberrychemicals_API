"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Inquiry_1 = __importDefault(require("../models/Inquiry"));
class InquiryService {
    async getAllInquiries(filter = {}) {
        return await Inquiry_1.default.find(filter).sort({ createdAt: -1 });
    }
    async getInquiryById(id) {
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        return await Inquiry_1.default.findById(id);
    }
    async createInquiry(data) {
        const inquiry = new Inquiry_1.default(data);
        return await inquiry.save();
    }
    async updateInquiry(id, data) {
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        return await Inquiry_1.default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async deleteInquiry(id) {
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        return await Inquiry_1.default.findByIdAndDelete(id);
    }
}
exports.InquiryService = InquiryService;
exports.default = new InquiryService();
