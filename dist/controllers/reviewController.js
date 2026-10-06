"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.createReview = exports.getReviewById = exports.getReviews = void 0;
const reviewService_1 = __importDefault(require("../services/reviewService"));
const responseHelper_1 = require("../helpers/responseHelper");
const uploadController_1 = require("./uploadController");
const getReviews = async (req, res) => {
    try {
        const { search, rate } = req.query;
        const reviews = await reviewService_1.default.getAllReviews({
            search: search ? String(search) : undefined,
            rate: rate ? String(rate) : undefined,
        });
        (0, responseHelper_1.sendSuccess)(res, reviews, 'Reviews fetched successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.getReviews = getReviews;
const getReviewById = async (req, res) => {
    try {
        const review = await reviewService_1.default.getReviewById(req.params.id);
        if (!review) {
            (0, responseHelper_1.sendError)(res, 'Review not found', 404);
            return;
        }
        (0, responseHelper_1.sendSuccess)(res, review, 'Review fetched successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.getReviewById = getReviewById;
const createReview = async (req, res) => {
    try {
        const { name, address, location, description, image, rate } = req.body;
        let processedImage = image || '/images/reviews/farmer_1.png';
        // Auto-save base64 image to assets/review folder and store URL in DB
        if (processedImage && typeof processedImage === 'string' && processedImage.startsWith('data:image/')) {
            processedImage = (0, uploadController_1.saveBase64Image)(processedImage, 'review');
        }
        const payload = {
            name: name ? String(name).trim() : '',
            address: address ? String(address).trim() : (location ? String(location).trim() : 'India'),
            description: description ? String(description).trim() : '',
            image: processedImage,
            rate: Number(rate) || 5,
        };
        const review = await reviewService_1.default.createReview(payload);
        (0, responseHelper_1.sendSuccess)(res, review, 'Review created successfully', 201);
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 400);
    }
};
exports.createReview = createReview;
const updateReview = async (req, res) => {
    try {
        const existing = await reviewService_1.default.getReviewById(req.params.id);
        if (!existing) {
            (0, responseHelper_1.sendError)(res, 'Review not found', 404);
            return;
        }
        const { name, address, location, description, image, rate } = req.body;
        let processedImage = image !== undefined ? image : existing.image;
        // Auto-save base64 image if new one is uploaded
        if (processedImage && typeof processedImage === 'string' && processedImage.startsWith('data:image/')) {
            processedImage = (0, uploadController_1.saveBase64Image)(processedImage, 'review');
            // Clean up old image if it was replaced
            if (existing.image && existing.image !== processedImage) {
                (0, uploadController_1.deleteImageFile)(existing.image);
            }
        }
        const payload = {
            name: name !== undefined ? String(name).trim() : existing.name,
            address: address !== undefined ? String(address).trim() : (location !== undefined ? String(location).trim() : existing.address),
            description: description !== undefined ? String(description).trim() : existing.description,
            image: processedImage,
            rate: rate !== undefined ? Number(rate) || 5 : existing.rate,
        };
        const review = await reviewService_1.default.updateReview(req.params.id, payload);
        (0, responseHelper_1.sendSuccess)(res, review, 'Review updated successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 400);
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    try {
        const review = await reviewService_1.default.getReviewById(req.params.id);
        if (!review) {
            (0, responseHelper_1.sendError)(res, 'Review not found', 404);
            return;
        }
        // Delete associated image file from disk if uploaded locally
        if (review.image) {
            (0, uploadController_1.deleteImageFile)(review.image);
        }
        await reviewService_1.default.deleteReview(req.params.id);
        (0, responseHelper_1.sendSuccess)(res, null, 'Review deleted successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.deleteReview = deleteReview;
