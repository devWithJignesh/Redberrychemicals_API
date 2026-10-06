import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { sendSuccess, sendError } from '../helpers/responseHelper';

// Normalize folder path to assets/<folderName> (e.g. assets/subproduct or assets/product)
const normalizeFolderName = (folder: string): string => {
  if (!folder) return 'product';
  const clean = folder.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (
    clean === 'sub-products' || 
    clean === 'sub_products' || 
    clean === 'subproducts' || 
    clean === 'subproduct' || 
    clean === 'sub-product' || 
    clean === 'sub_product'
  ) {
    return 'subproduct';
  }
  if (clean === 'products' || clean === 'product') {
    return 'product';
  }
  return clean;
};

// Helper to save a single base64 image string to disk under assets/<folderName>
export const saveBase64Image = (base64String: string, folderName: string = 'subproduct'): string => {
  const normalizedFolder = normalizeFolderName(folderName);

  // If already an HTTP/HTTPS URL or existing static URL, return as-is
  if (
    base64String.startsWith('http://') || 
    base64String.startsWith('https://') || 
    (base64String.startsWith('/assets/') && !base64String.startsWith('data:image/')) ||
    (base64String.startsWith('/uploads/') && !base64String.startsWith('data:image/'))
  ) {
    return base64String;
  }

  // Parse mime type and base64 data
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let ext = 'jpg';
  let buffer: Buffer;

  if (matches && matches.length === 3) {
    const mimeType = matches[1];
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else ext = 'jpg';

    buffer = Buffer.from(matches[2], 'base64');
  } else {
    // If raw base64 without prefix
    buffer = Buffer.from(base64String, 'base64');
  }

  // Target directory inside backend assets folder (e.g., assets/subproduct)
  const targetDir = path.join(process.cwd(), 'assets', normalizedFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Unique timestamped filename
  const filename = `${normalizedFolder}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const filePath = path.join(targetDir, filename);

  fs.writeFileSync(filePath, buffer);

  // Return static URL accessible from browser
  const host =
    process.env.APP_URL ||
    process.env.BACKEND_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://redberrychemicals-api-8pjv.vercel.app');

  const baseHost =
    process.env.NODE_ENV === 'development' || !process.env.VERCEL
      ? 'http://localhost:5000'
      : host;

  return `${baseHost}/assets/${normalizedFolder}/${filename}`;
};

// Helper to safely delete an image from the assets/ or uploads/ folder on disk
export const deleteImageFile = (imageUrl?: string): boolean => {
  if (!imageUrl || typeof imageUrl !== 'string') return false;

  // Only delete files under /assets/ or /uploads/
  if (
    !imageUrl.includes('/assets/') &&
    !imageUrl.includes('/uploads/')
  ) {
    return false;
  }

  try {
    let relativePath = '';
    if (imageUrl.includes('/assets/')) {
      relativePath = imageUrl.substring(imageUrl.indexOf('/assets/'));
    } else if (imageUrl.includes('/uploads/')) {
      relativePath = imageUrl.substring(imageUrl.indexOf('/uploads/'));
    }

    // Clean query parameters or hash if any
    relativePath = relativePath.split('?')[0].split('#')[0];

    // Remove leading slash for path.join
    if (relativePath.startsWith('/')) {
      relativePath = relativePath.substring(1);
    }

    const fullPath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`\x1b[32m🗑️ Deleted image from disk:\x1b[0m ${fullPath}`);
      return true;
    }
  } catch (err) {
    console.warn(`Could not delete image file from disk: ${imageUrl}`, err);
  }
  return false;
};

export const deleteImageFiles = (imageUrls?: string[]): void => {
  if (Array.isArray(imageUrls)) {
    imageUrls.forEach((url) => deleteImageFile(url));
  }
};

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, images, folder = 'subproduct' } = req.body;

    if (Array.isArray(images) && images.length > 0) {
      const urls = images.map((img) => saveBase64Image(img, folder));
      sendSuccess(res, { urls, count: urls.length }, 'Images stored in assets folder successfully', 201);
      return;
    }

    if (image) {
      const url = saveBase64Image(image, folder);
      sendSuccess(res, { url }, 'Image stored in assets folder successfully', 201);
      return;
    }

    sendError(res, 'No image data provided', 400);
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};
