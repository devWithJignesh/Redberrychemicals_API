import { Request, Response } from 'express';
import subProductService from '../services/subProductService';
import { sendSuccess, sendError } from '../helpers/responseHelper';
import { saveBase64Image, deleteImageFile, deleteImageFiles } from './uploadController';

export const getSubProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.query;
    const filter = productId ? { productId } : {};
    const subProducts = await subProductService.getAllSubProducts(filter);
    sendSuccess(res, subProducts, 'Sub-products fetched successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getSubProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const subProduct = await subProductService.getSubProductById(req.params.id);
    if (!subProduct) {
      sendError(res, 'Sub-product not found', 404);
      return;
    }
    sendSuccess(res, subProduct, 'Sub-product fetched successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getSubProductsByProductId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const subProducts = await subProductService.getSubProductsByProductId(productId);
    sendSuccess(res, subProducts, 'Sub-products fetched successfully for product');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const createSubProduct = async (req: Request, res: Response): Promise<void> => {
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
      payload.image = saveBase64Image(payload.image, 'subproduct');
    }

    if (Array.isArray(payload.images) && payload.images.length > 0) {
      payload.images = payload.images.map((img: string) => {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          return saveBase64Image(img, 'subproduct');
        }
        return img;
      });
      if (!payload.image && payload.images.length > 0) {
        payload.image = payload.images[0];
      }
    }

    const subProduct = await subProductService.createSubProduct(payload);
    sendSuccess(res, subProduct, 'Sub-product created successfully', 201);
  } catch (error) {
    sendError(res, (error as Error).message, 400);
  }
};

export const updateSubProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await subProductService.getSubProductById(req.params.id);
    if (!existing) {
      sendError(res, 'Sub-product not found', 404);
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
      payload.image = saveBase64Image(payload.image, 'subproduct');
    }

    if (Array.isArray(payload.images) && payload.images.length > 0) {
      payload.images = payload.images.map((img: string) => {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          return saveBase64Image(img, 'subproduct');
        }
        return img;
      });
      if (!payload.image && payload.images.length > 0) {
        payload.image = payload.images[0];
      }
    }

    // Clean up removed image files from server disk
    if (payload.images || payload.image) {
      const existingImages = [...(existing.images || []), existing.image].filter(Boolean) as string[];
      const newImages = [...(payload.images || []), payload.image].filter(Boolean) as string[];
      const removedImages = existingImages.filter((img) => !newImages.includes(img));
      deleteImageFiles(removedImages);
    }

    const subProduct = await subProductService.updateSubProduct(req.params.id, payload);
    sendSuccess(res, subProduct, 'Sub-product updated successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 400);
  }
};

export const deleteSubProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const subProduct = await subProductService.getSubProductById(req.params.id);
    if (!subProduct) {
      sendError(res, 'Sub-product not found', 404);
      return;
    }

    // 1. Delete associated image files from assets/subproduct/
    deleteImageFile(subProduct.image);
    deleteImageFiles(subProduct.images);

    // 2. Delete sub-product from database
    await subProductService.deleteSubProduct(req.params.id);
    sendSuccess(res, null, 'Sub-product and associated images deleted from server disk successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};
