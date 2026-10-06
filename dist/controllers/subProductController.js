"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubProduct = exports.updateSubProduct = exports.createSubProduct = exports.getSubProductsByProductId = exports.getSubProductById = exports.getSubProducts = void 0;
const subProductService_1 = __importDefault(require("../services/subProductService"));
const responseHelper_1 = require("../helpers/responseHelper");
const cloudinaryService_1 = require("../services/cloudinaryService");
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
        // Upload base64 single image to Cloudinary
        if (payload.image && typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
            payload.image = await (0, cloudinaryService_1.uploadToCloudinary)(payload.image, 'subproducts');
        }
        // Upload array of base64 images to Cloudinary
        if (Array.isArray(payload.images) && payload.images.length > 0) {
            const uploadedImages = await Promise.all(payload.images.map((img) => {
                if (typeof img === 'string' && img.startsWith('data:image/')) {
                    return (0, cloudinaryService_1.uploadToCloudinary)(img, 'subproducts');
                }
                return img;
            }));
            payload.images = uploadedImages;
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
        // Upload base64 single image to Cloudinary
        if (payload.image && typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
            payload.image = await (0, cloudinaryService_1.uploadToCloudinary)(payload.image, 'subproducts');
        }
        // Upload array of base64 images to Cloudinary
        if (Array.isArray(payload.images) && payload.images.length > 0) {
            const uploadedImages = await Promise.all(payload.images.map((img) => {
                if (typeof img === 'string' && img.startsWith('data:image/')) {
                    return (0, cloudinaryService_1.uploadToCloudinary)(img, 'subproducts');
                }
                return img;
            }));
            payload.images = uploadedImages;
            if (!payload.image && payload.images.length > 0) {
                payload.image = payload.images[0];
            }
        }
        // Clean up replaced / removed images from Cloudinary
        if (payload.images || payload.image) {
            const existingImages = [...(existing.images || []), existing.image].filter(Boolean);
            const newImages = [...(payload.images || []), payload.image].filter(Boolean);
            const removedImages = existingImages.filter((img) => !newImages.includes(img));
            await (0, cloudinaryService_1.deleteMultipleFromCloudinary)(removedImages);
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
        // 1. Delete associated images from Cloudinary
        if (subProduct.image)
            await (0, cloudinaryService_1.deleteFromCloudinary)(subProduct.image);
        if (subProduct.images)
            await (0, cloudinaryService_1.deleteMultipleFromCloudinary)(subProduct.images);
        // 2. Delete sub-product record from MongoDB
        await subProductService_1.default.deleteSubProduct(req.params.id);
        (0, responseHelper_1.sendSuccess)(res, null, 'Sub-product and associated Cloudinary assets deleted successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.deleteSubProduct = deleteSubProduct;
