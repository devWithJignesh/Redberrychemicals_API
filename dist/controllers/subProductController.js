"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubProduct = exports.updateSubProduct = exports.createSubProduct = exports.getSubProductsByProductId = exports.getSubProductById = exports.getSubProducts = void 0;
const subProductService_1 = __importDefault(require("../services/subProductService"));
const responseHelper_1 = require("../helpers/responseHelper");
const uploadController_1 = require("./uploadController");
const getSubProducts = async (req, res) => {
    try {
        const { productId } = req.query;
        const filter = productId ? { productId } : {};
        const subProducts = await subProductService_1.default.getAllSubProducts(filter);
        (0, responseHelper_1.sendSuccess)(res, subProducts, 'Sub-products fetched successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.getSubProducts = getSubProducts;
const getSubProductById = async (req, res) => {
    try {
        const subProduct = await subProductService_1.default.getSubProductById(req.params.id);
        if (!subProduct) {
            (0, responseHelper_1.sendError)(res, 'Sub-product not found', 404);
            return;
        }
        (0, responseHelper_1.sendSuccess)(res, subProduct, 'Sub-product fetched successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.getSubProductById = getSubProductById;
const getSubProductsByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const subProducts = await subProductService_1.default.getSubProductsByProductId(productId);
        (0, responseHelper_1.sendSuccess)(res, subProducts, 'Sub-products fetched successfully for product');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.getSubProductsByProductId = getSubProductsByProductId;
const createSubProduct = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (!payload.productId && payload.parentProductId) {
            payload.productId = payload.parentProductId;
        }
        if (!payload.parentProductId && payload.productId) {
            payload.parentProductId = String(payload.productId);
        }
        // Auto-save base64 images to assets/subproduct folder and store URLs in DB
        if (payload.image && typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
            payload.image = (0, uploadController_1.saveBase64Image)(payload.image, 'subproduct');
        }
        if (Array.isArray(payload.images) && payload.images.length > 0) {
            payload.images = payload.images.map((img) => {
                if (typeof img === 'string' && img.startsWith('data:image/')) {
                    return (0, uploadController_1.saveBase64Image)(img, 'subproduct');
                }
                return img;
            });
            if (!payload.image && payload.images.length > 0) {
                payload.image = payload.images[0];
            }
        }
        const subProduct = await subProductService_1.default.createSubProduct(payload);
        (0, responseHelper_1.sendSuccess)(res, subProduct, 'Sub-product created successfully', 201);
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 400);
    }
};
exports.createSubProduct = createSubProduct;
const updateSubProduct = async (req, res) => {
    try {
        const existing = await subProductService_1.default.getSubProductById(req.params.id);
        if (!existing) {
            (0, responseHelper_1.sendError)(res, 'Sub-product not found', 404);
            return;
        }
        const payload = { ...req.body };
        if (!payload.productId && payload.parentProductId) {
            payload.productId = payload.parentProductId;
        }
        if (!payload.parentProductId && payload.productId) {
            payload.parentProductId = String(payload.productId);
        }
        // Auto-save base64 images to assets/subproduct folder and store URLs in DB
        if (payload.image && typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
            payload.image = (0, uploadController_1.saveBase64Image)(payload.image, 'subproduct');
        }
        if (Array.isArray(payload.images) && payload.images.length > 0) {
            payload.images = payload.images.map((img) => {
                if (typeof img === 'string' && img.startsWith('data:image/')) {
                    return (0, uploadController_1.saveBase64Image)(img, 'subproduct');
                }
                return img;
            });
            if (!payload.image && payload.images.length > 0) {
                payload.image = payload.images[0];
            }
        }
        // Clean up removed image files from server disk
        if (payload.images || payload.image) {
            const existingImages = [...(existing.images || []), existing.image].filter(Boolean);
            const newImages = [...(payload.images || []), payload.image].filter(Boolean);
            const removedImages = existingImages.filter((img) => !newImages.includes(img));
            (0, uploadController_1.deleteImageFiles)(removedImages);
        }
        const subProduct = await subProductService_1.default.updateSubProduct(req.params.id, payload);
        (0, responseHelper_1.sendSuccess)(res, subProduct, 'Sub-product updated successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 400);
    }
};
exports.updateSubProduct = updateSubProduct;
const deleteSubProduct = async (req, res) => {
    try {
        const subProduct = await subProductService_1.default.getSubProductById(req.params.id);
        if (!subProduct) {
            (0, responseHelper_1.sendError)(res, 'Sub-product not found', 404);
            return;
        }
        // 1. Delete associated image files from assets/subproduct/
        (0, uploadController_1.deleteImageFile)(subProduct.image);
        (0, uploadController_1.deleteImageFiles)(subProduct.images);
        // 2. Delete sub-product from database
        await subProductService_1.default.deleteSubProduct(req.params.id);
        (0, responseHelper_1.sendSuccess)(res, null, 'Sub-product and associated images deleted from server disk successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.deleteSubProduct = deleteSubProduct;
