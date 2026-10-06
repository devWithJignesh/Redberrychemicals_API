import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  name: string;
  address: string;
  description: string;
  image: string;
  rate: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: '/images/reviews/farmer_1.png' },
    rate: { type: Number, required: true, min: 1, max: 5, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
