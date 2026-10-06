import { Request, Response } from 'express';
import productService from '../services/productService';
import subProductService from '../services/subProductService';
import { sendSuccess, sendError } from '../helpers/responseHelper';
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from '../services/cloudinaryService';

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

    // Upload base64 single image to Cloudinary
    if (payload.image && typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
      payload.image = await uploadToCloudinary(payload.image, 'products');
    }

    // Upload array of base64 images to Cloudinary
    if (Array.isArray(payload.images) && payload.images.length > 0) {
      const uploadedImages = await Promise.all(
        payload.images.map((img: string) => {
          if (typeof img === 'string' && img.startsWith('data:image/')) {
            return uploadToCloudinary(img, 'products');
          }
          return img;
        })
      );
      payload.images = uploadedImages;
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

    // Upload base64 single image to Cloudinary
    if (payload.image && typeof payload.image === 'string' && payload.image.startsWith('data:image/')) {
      payload.image = await uploadToCloudinary(payload.image, 'products');
    }

    // Upload array of base64 images to Cloudinary
    if (Array.isArray(payload.images) && payload.images.length > 0) {
      const uploadedImages = await Promise.all(
        payload.images.map((img: string) => {
          if (typeof img === 'string' && img.startsWith('data:image/')) {
            return uploadToCloudinary(img, 'products');
          }
          return img;
        })
      );
      payload.images = uploadedImages;
      if (!payload.image && payload.images.length > 0) {
        payload.image = payload.images[0];
      }
    }

    // Clean up replaced / removed images from Cloudinary
    if (payload.images || payload.image) {
      const existingImages = [...(existing.images || []), existing.image].filter(Boolean) as string[];
      const newImages = [...(payload.images || []), payload.image].filter(Boolean) as string[];
      const removedImages = existingImages.filter((img) => !newImages.includes(img));
      await deleteMultipleFromCloudinary(removedImages);
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

    // 1. Delete image from Cloudinary
    if (product.image) await deleteFromCloudinary(product.image);
    if (product.images) await deleteMultipleFromCloudinary(product.images);

    // 2. Also delete all associated sub-products and their Cloudinary images
    const subProducts = await subProductService.getSubProductsByProductId(req.params.id);
    if (Array.isArray(subProducts) && subProducts.length > 0) {
      for (const sp of subProducts) {
        if (sp.image) await deleteFromCloudinary(sp.image);
        if (sp.images) await deleteMultipleFromCloudinary(sp.images);
        const spId = sp._id ? String(sp._id) : String(sp.id);
        await subProductService.deleteSubProduct(spId);
      }
    }

    // 3. Delete product record from MongoDB
    await productService.deleteProduct(req.params.id);
    sendSuccess(res, null, 'Product and associated Cloudinary assets deleted successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};
