"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubProductService = void 0;
const SubProduct_1 = __importDefault(require("../models/SubProduct"));
class SubProductService {
    async getAllSubProducts(filter = {}) {
        const query = filter.productId
            ? { $or: [{ productId: filter.productId }, { parentProductId: filter.productId }] }
            : filter;
        const items = await SubProduct_1.default.find(query).sort({ createdAt: -1 });
        return items;
    }
    async getSubProductById(id) {
        return await SubProduct_1.default.findById(id);
    }
    async getSubProductsByProductId(productId) {
        return await SubProduct_1.default.find({
            $or: [
                { productId: productId },
                { parentProductId: productId }
            ]
        }).sort({ createdAt: -1 });
    }
    async createSubProduct(data) {
        const subProduct = new SubProduct_1.default(data);
        return await subProduct.save();
    }
    async updateSubProduct(id, data) {
        return await SubProduct_1.default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async deleteSubProduct(id) {
        return await SubProduct_1.default.findByIdAndDelete(id);
    }
}
exports.SubProductService = SubProductService;
exports.default = new SubProductService();
