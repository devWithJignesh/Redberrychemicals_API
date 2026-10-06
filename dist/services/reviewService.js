"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Review_1 = __importDefault(require("../models/Review"));
class ReviewService {
    async getAllReviews(filters = {}) {
        const query = {};
        if (filters.rate && filters.rate !== 'all' && filters.rate !== 'All') {
            query.rate = Number(filters.rate);
        }
        if (filters.search) {
            const searchRegex = new RegExp(filters.search.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { address: searchRegex },
                { description: searchRegex },
            ];
        }
        return await Review_1.default.find(query).sort({ createdAt: -1 });
    }
    async getReviewById(id) {
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        return await Review_1.default.findById(id);
    }
    async createReview(data) {
        const review = new Review_1.default(data);
        return await review.save();
    }
    async updateReview(id, data) {
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        return await Review_1.default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    async deleteReview(id) {
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        return await Review_1.default.findByIdAndDelete(id);
    }
}
exports.ReviewService = ReviewService;
exports.default = new ReviewService();
