import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category?: string;
  shortDescription: string;
  description?: string;
  features?: string[];
  dosage?: string;
  targetPests?: string;
  packSizes?: string[];
  image?: string;
  images?: string[];
  status: 'Active' | 'Draft' | 'Archived';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: { type: String, default: 'Insecticides', index: true },
    shortDescription: { type: String, required: true, default: '' },
    description: { type: String, default: '' },
    features: { type: [String], default: [] },
    dosage: { type: String, default: '' },
    targetPests: { type: String, default: '' },
    packSizes: { type: [String], default: [] },
    image: { type: String, default: '/images/products/premium_dummy.jpg' },
    images: { type: [String], default: [] },
    status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active', index: true },
  },
  { timestamps: true }
);

// Indexes for fast database lookups & sorting
ProductSchema.index({ name: 'text', category: 'text', shortDescription: 'text', description: 'text', targetPests: 'text' });
ProductSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
