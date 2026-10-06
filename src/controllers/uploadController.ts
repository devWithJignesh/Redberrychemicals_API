import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../helpers/responseHelper';
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from '../services/cloudinaryService';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, images, folder = 'general' } = req.body;

    if (Array.isArray(images) && images.length > 0) {
      const urls = await uploadMultipleToCloudinary(images, folder);
      sendSuccess(res, { urls, count: urls.length }, 'Images uploaded to Cloudinary successfully', 201);
      return;
    }

    if (image) {
      const url = await uploadToCloudinary(image, folder);
      sendSuccess(res, { url }, 'Image uploaded to Cloudinary successfully', 201);
      return;
    }

    sendError(res, 'No image data provided', 400);
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
};
