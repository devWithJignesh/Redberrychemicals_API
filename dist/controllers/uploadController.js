"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.deleteImageFiles = exports.deleteImageFile = exports.saveBase64Image = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const responseHelper_1 = require("../helpers/responseHelper");
// Normalize folder path to assets/<folderName> (e.g. assets/subproduct or assets/product)
const normalizeFolderName = (folder) => {
    if (!folder)
        return 'product';
    const clean = folder.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean === 'sub-products' ||
        clean === 'sub_products' ||
        clean === 'subproducts' ||
        clean === 'subproduct' ||
        clean === 'sub-product' ||
        clean === 'sub_product') {
        return 'subproduct';
    }
    if (clean === 'products' || clean === 'product') {
        return 'product';
    }
    return clean;
};
// Helper to save a single base64 image string to disk under assets/<folderName>
const saveBase64Image = (base64String, folderName = 'subproduct') => {
    const normalizedFolder = normalizeFolderName(folderName);
    // If already an HTTP/HTTPS URL or existing static URL, return as-is
    if (base64String.startsWith('http://') ||
        base64String.startsWith('https://') ||
        (base64String.startsWith('/assets/') && !base64String.startsWith('data:image/')) ||
        (base64String.startsWith('/uploads/') && !base64String.startsWith('data:image/'))) {
        return base64String;
    }
    // Parse mime type and base64 data
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let ext = 'jpg';
    let buffer;
    if (matches && matches.length === 3) {
        const mimeType = matches[1];
        if (mimeType.includes('png'))
            ext = 'png';
        else if (mimeType.includes('webp'))
            ext = 'webp';
        else if (mimeType.includes('gif'))
            ext = 'gif';
        else
            ext = 'jpg';
        buffer = Buffer.from(matches[2], 'base64');
    }
    else {
        // If raw base64 without prefix
        buffer = Buffer.from(base64String, 'base64');
    }
    // Target directory inside backend assets folder (e.g., assets/subproduct)
    const targetDir = path_1.default.join(process.cwd(), 'assets', normalizedFolder);
    if (!fs_1.default.existsSync(targetDir)) {
        fs_1.default.mkdirSync(targetDir, { recursive: true });
    }
    // Unique timestamped filename
    const filename = `${normalizedFolder}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = path_1.default.join(targetDir, filename);
    fs_1.default.writeFileSync(filePath, buffer);
    // Return static URL accessible from browser
    return `http://localhost:5000/assets/${normalizedFolder}/${filename}`;
};
exports.saveBase64Image = saveBase64Image;
// Helper to safely delete an image from the assets/ or uploads/ folder on disk
const deleteImageFile = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string')
        return false;
    // Only delete files under /assets/ or /uploads/
    if (!imageUrl.includes('/assets/') &&
        !imageUrl.includes('/uploads/')) {
        return false;
    }
    try {
        let relativePath = '';
        if (imageUrl.includes('/assets/')) {
            relativePath = imageUrl.substring(imageUrl.indexOf('/assets/'));
        }
        else if (imageUrl.includes('/uploads/')) {
            relativePath = imageUrl.substring(imageUrl.indexOf('/uploads/'));
        }
        // Clean query parameters or hash if any
        relativePath = relativePath.split('?')[0].split('#')[0];
        // Remove leading slash for path.join
        if (relativePath.startsWith('/')) {
            relativePath = relativePath.substring(1);
        }
        const fullPath = path_1.default.join(process.cwd(), relativePath);
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
            console.log(`\x1b[32m🗑️ Deleted image from disk:\x1b[0m ${fullPath}`);
            return true;
        }
    }
    catch (err) {
        console.warn(`Could not delete image file from disk: ${imageUrl}`, err);
    }
    return false;
};
exports.deleteImageFile = deleteImageFile;
const deleteImageFiles = (imageUrls) => {
    if (Array.isArray(imageUrls)) {
        imageUrls.forEach((url) => (0, exports.deleteImageFile)(url));
    }
};
exports.deleteImageFiles = deleteImageFiles;
const uploadImage = async (req, res) => {
    try {
        const { image, images, folder = 'subproduct' } = req.body;
        if (Array.isArray(images) && images.length > 0) {
            const urls = images.map((img) => (0, exports.saveBase64Image)(img, folder));
            (0, responseHelper_1.sendSuccess)(res, { urls, count: urls.length }, 'Images stored in assets folder successfully', 201);
            return;
        }
        if (image) {
            const url = (0, exports.saveBase64Image)(image, folder);
            (0, responseHelper_1.sendSuccess)(res, { url }, 'Image stored in assets folder successfully', 201);
            return;
        }
        (0, responseHelper_1.sendError)(res, 'No image data provided', 400);
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.uploadImage = uploadImage;
