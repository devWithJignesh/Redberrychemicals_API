import mongoose from 'mongoose';
import Review, { IReview } from '../models/Review';

export interface ReviewFilter {
  search?: string;
  rate?: number | string;
}

export class ReviewService {
  async getAllReviews(filters: ReviewFilter = {}): Promise<IReview[]> {
    const query: Record<string, any> = {};

    if (filters.rate && filters.rate !== 'all' && filters.rate !== 'All') {
      query.rate = Number(filters.rate);
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { description: searchRegex },
      ];
    }

    return await Review.find(query).sort({ createdAt: -1 });
  }

  async getReviewById(id: string): Promise<IReview | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
    return await Review.findById(id);
  }

  async createReview(data: Partial<IReview>): Promise<IReview> {
    const review = new Review(data);
    return await review.save();
  }

  async updateReview(id: string, data: Partial<IReview>): Promise<IReview | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
    return await Review.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteReview(id: string): Promise<IReview | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
    return await Review.findByIdAndDelete(id);
  }
}

export default new ReviewService();
