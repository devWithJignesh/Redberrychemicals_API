import { Request, Response } from 'express';
import reviewService from '../services/reviewService';
import { sendSuccess, sendError } from '../helpers/responseHelper';
import { saveBase64Image, deleteImageFile } from './uploadController';

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, rate } = req.query;

    const reviews = await reviewService.getAllReviews({
      search: search ? String(search) : undefined,
      rate: rate ? String(rate) : undefined,
    });

    sendSuccess(res, reviews, 'Reviews fetched successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    if (!review) {
      sendError(res, 'Review not found', 404);
      return;
    }
    sendSuccess(res, review, 'Review fetched successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, address, location, description, image, rate } = req.body;

    let processedImage = image || '/images/reviews/farmer_1.png';

    // Auto-save base64 image to assets/review folder and store URL in DB
    if (processedImage && typeof processedImage === 'string' && processedImage.startsWith('data:image/')) {
      processedImage = saveBase64Image(processedImage, 'review');
    }

    const payload = {
      name: name ? String(name).trim() : '',
      address: address ? String(address).trim() : (location ? String(location).trim() : 'India'),
      description: description ? String(description).trim() : '',
      image: processedImage,
      rate: Number(rate) || 5,
    };

    const review = await reviewService.createReview(payload);
    sendSuccess(res, review, 'Review created successfully', 201);
  } catch (error) {
    sendError(res, (error as Error).message, 400);
  }
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await reviewService.getReviewById(req.params.id);
    if (!existing) {
      sendError(res, 'Review not found', 404);
      return;
    }

    const { name, address, location, description, image, rate } = req.body;

    let processedImage = image !== undefined ? image : existing.image;

    // Auto-save base64 image if new one is uploaded
    if (processedImage && typeof processedImage === 'string' && processedImage.startsWith('data:image/')) {
      processedImage = saveBase64Image(processedImage, 'review');
      // Clean up old image if it was replaced
      if (existing.image && existing.image !== processedImage) {
        deleteImageFile(existing.image);
      }
    }

    const payload = {
      name: name !== undefined ? String(name).trim() : existing.name,
      address: address !== undefined ? String(address).trim() : (location !== undefined ? String(location).trim() : existing.address),
      description: description !== undefined ? String(description).trim() : existing.description,
      image: processedImage,
      rate: rate !== undefined ? Number(rate) || 5 : existing.rate,
    };

    const review = await reviewService.updateReview(req.params.id, payload);
    sendSuccess(res, review, 'Review updated successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 400);
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    if (!review) {
      sendError(res, 'Review not found', 404);
      return;
    }

    // Delete associated image file from disk if uploaded locally
    if (review.image) {
      deleteImageFile(review.image);
    }

    await reviewService.deleteReview(req.params.id);
    sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};
