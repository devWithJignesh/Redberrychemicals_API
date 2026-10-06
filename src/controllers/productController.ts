import { Request, Response } from 'express';
import productService from '../services/productService';
import subProductService from '../services/subProductService';
import { sendSuccess, sendError } from '../helpers/responseHelper';
import { saveBase64Image, deleteImageFile, deleteImageFiles } from './uploadController';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, category } = req.query;

    const result = await productService.getPaginatedProducts({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
    });

    sendSuccess(res, result, 'Products fetched successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }
    sendSuccess(res, product, 'Product fetched successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = { ...req.body };

    // Auto-save base64 images to assets/product folder and store URLs in DB
    if (payload.image && typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
      payload.image = saveBase64Image(payload.image, 'product');
    }

    if (Array.isArray(payload.images) && payload.images.length > 0) {
      payload.images = payload.images.map((img: string) => {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          return saveBase64Image(img, 'product');
        }
        return img;
      });
      if (!payload.image && payload.images.length > 0) {
        payload.image = payload.images[0];
      }
    }

    const product = await productService.createProduct(payload);
    sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    sendError(res, (error as Error).message, 400);
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await productService.getProductById(req.params.id);
    if (!existing) {
      sendError(res, 'Product not found', 404);
      return;
    }

    const payload = { ...req.body };

    // Auto-save base64 images to assets/product folder and store URLs in DB
    if (payload.image && typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
      payload.image = saveBase64Image(payload.image, 'product');
    }

    if (Array.isArray(payload.images) && payload.images.length > 0) {
      payload.images = payload.images.map((img: string) => {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          return saveBase64Image(img, 'product');
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

    const product = await productService.updateProduct(req.params.id, payload);
    sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 400);
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }

    // 1. Delete image files from disk for this product
    deleteImageFile(product.image);
    deleteImageFiles(product.images);

    // 2. Also delete all associated sub-products and their images from disk
    const subProducts = await subProductService.getSubProductsByProductId(req.params.id);
    if (Array.isArray(subProducts) && subProducts.length > 0) {
      for (const sp of subProducts) {
        deleteImageFile(sp.image);
        deleteImageFiles(sp.images);
        const spId = sp._id ? String(sp._id) : String(sp.id);
        await subProductService.deleteSubProduct(spId);
      }
    }

    // 3. Delete the product record from DB
    await productService.deleteProduct(req.params.id);
    sendSuccess(res, null, 'Product and associated images deleted from server disk successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};
