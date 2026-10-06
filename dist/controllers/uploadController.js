"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleFromCloudinary = exports.deleteFromCloudinary = exports.uploadMultipleToCloudinary = exports.uploadToCloudinary = exports.uploadImage = void 0;
const responseHelper_1 = require("../helpers/responseHelper");
const cloudinaryService_1 = require("../services/cloudinaryService");
Object.defineProperty(exports, "uploadToCloudinary", { enumerable: true, get: function () { return cloudinaryService_1.uploadToCloudinary; } });
Object.defineProperty(exports, "uploadMultipleToCloudinary", { enumerable: true, get: function () { return cloudinaryService_1.uploadMultipleToCloudinary; } });
Object.defineProperty(exports, "deleteFromCloudinary", { enumerable: true, get: function () { return cloudinaryService_1.deleteFromCloudinary; } });
Object.defineProperty(exports, "deleteMultipleFromCloudinary", { enumerable: true, get: function () { return cloudinaryService_1.deleteMultipleFromCloudinary; } });
const uploadImage = async (req, res) => {
    try {
        const { image, images, folder = 'general' } = req.body;
        if (Array.isArray(images) && images.length > 0) {
            const urls = await (0, cloudinaryService_1.uploadMultipleToCloudinary)(images, folder);
            (0, responseHelper_1.sendSuccess)(res, { urls, count: urls.length }, 'Images uploaded to Cloudinary successfully', 201);
            return;
        }
        if (image) {
            const url = await (0, cloudinaryService_1.uploadToCloudinary)(image, folder);
            (0, responseHelper_1.sendSuccess)(res, { url }, 'Image uploaded to Cloudinary successfully', 201);
            return;
        }
        (0, responseHelper_1.sendError)(res, 'No image data provided', 400);
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.uploadImage = uploadImage;
