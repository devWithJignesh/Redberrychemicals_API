"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const productService_1 = __importDefault(require("../services/productService"));
const subProductService_1 = __importDefault(require("../services/subProductService"));
const responseHelper_1 = require("../helpers/responseHelper");
const uploadController_1 = require("./uploadController");
const getProducts = async (req, res) => {
    try {
        const { page, limit, search, category } = req.query;
        const result = await productService_1.default.getPaginatedProducts({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search: search ? String(search) : undefined,
            category: category ? String(category) : undefined,
        });
        (0, responseHelper_1.sendSuccess)(res, result, 'Products fetched successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const product = await productService_1.default.getProductById(req.params.id);
        if (!product) {
            (0, responseHelper_1.sendError)(res, 'Product not found', 404);
            return;
        }
        (0, responseHelper_1.sendSuccess)(res, product, 'Product fetched successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const payload = { ...req.body };
        // Auto-save base64 images to assets/product folder and store URLs in DB
        if (payload.image && typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
            payload.image = (0, uploadController_1.saveBase64Image)(payload.image, 'product');
        }
        if (Array.isArray(payload.images) && payload.images.length > 0) {
            payload.images = payload.images.map((img) => {
                if (typeof img === 'string' && img.startsWith('data:image/')) {
                    return (0, uploadController_1.saveBase64Image)(img, 'product');
                }
                return img;
            });
            if (!payload.image && payload.images.length > 0) {
                payload.image = payload.images[0];
            }
        }
        const product = await productService_1.default.createProduct(payload);
        (0, responseHelper_1.sendSuccess)(res, product, 'Product created successfully', 201);
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 400);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const existing = await productService_1.default.getProductById(req.params.id);
        if (!existing) {
            (0, responseHelper_1.sendError)(res, 'Product not found', 404);
            return;
        }
        const payload = { ...req.body };
        // Auto-save base64 images to assets/product folder and store URLs in DB
        if (payload.image && typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
            payload.image = (0, uploadController_1.saveBase64Image)(payload.image, 'product');
        }
        if (Array.isArray(payload.images) && payload.images.length > 0) {
            payload.images = payload.images.map((img) => {
                if (typeof img === 'string' && img.startsWith('data:image/')) {
                    return (0, uploadController_1.saveBase64Image)(img, 'product');
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
        const product = await productService_1.default.updateProduct(req.params.id, payload);
        (0, responseHelper_1.sendSuccess)(res, product, 'Product updated successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 400);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const product = await productService_1.default.getProductById(req.params.id);
        if (!product) {
            (0, responseHelper_1.sendError)(res, 'Product not found', 404);
            return;
        }
        // 1. Delete image files from disk for this product
        (0, uploadController_1.deleteImageFile)(product.image);
        (0, uploadController_1.deleteImageFiles)(product.images);
        // 2. Also delete all associated sub-products and their images from disk
        const subProducts = await subProductService_1.default.getSubProductsByProductId(req.params.id);
        if (Array.isArray(subProducts) && subProducts.length > 0) {
            for (const sp of subProducts) {
                (0, uploadController_1.deleteImageFile)(sp.image);
                (0, uploadController_1.deleteImageFiles)(sp.images);
                const spId = sp._id ? String(sp._id) : String(sp.id);
                await subProductService_1.default.deleteSubProduct(spId);
            }
        }
        // 3. Delete the product record from DB
        await productService_1.default.deleteProduct(req.params.id);
        (0, responseHelper_1.sendSuccess)(res, null, 'Product and associated images deleted from server disk successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.deleteProduct = deleteProduct;
