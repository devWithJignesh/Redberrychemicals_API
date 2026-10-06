"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const Product_1 = __importDefault(require("../models/Product"));
class ProductService {
    async getPaginatedProducts(options = {}) {
        const page = Math.max(1, Number(options.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(options.limit) || 8));
        const skip = (page - 1) * limit;
        const query = {};
        // Category filter
        if (options.category && options.category !== 'ALL' && options.category !== 'all') {
            query.category = { $regex: new RegExp(`^${options.category.trim()}$`, 'i') };
        }
        // Search filter across name, category, shortDescription, and description
        if (options.search && options.search.trim()) {
            const searchRegex = new RegExp(options.search.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { category: searchRegex },
                { targetPests: searchRegex },
                { shortDescription: searchRegex },
                { description: searchRegex },
            ];
        }
        const [products, total] = await Promise.all([
            Product_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Product_1.default.countDocuments(query),
        ]);
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    async getAllProducts(filter = {}) {
        return await Product_1.default.find(filter).sort({ createdAt: -1 });
    }
    async getProductById(id) {
        return await Product_1.default.findById(id);
    }
    async createProduct(data) {
        const product = new Product_1.default(data);
        return await product.save();
    }
    async updateProduct(id, data) {
        return await Product_1.default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async deleteProduct(id) {
        return await Product_1.default.findByIdAndDelete(id);
    }
}
exports.ProductService = ProductService;
exports.default = new ProductService();
