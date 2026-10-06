import mongoose, { Schema, Document } from 'mongoose';

export interface ISubProduct extends Document {
  name: string;
  productId?: any;
  parentProductId?: string;
  parentProductName?: string;
  dosage?: string;
  packagingSizes: string[];
  shortDescription?: string;
  description?: string;
  image?: string;
  images?: string[];
  status: 'Active' | 'Draft' | 'Archived';
  createdAt: Date;
  updatedAt: Date;
}

const SubProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    productId: { 
      type: Schema.Types.Mixed, 
      ref: 'Product', 
      required: false, 
      index: true 
    },
    parentProductId: { type: String, default: '', index: true },
    parentProductName: { type: String, default: 'Agro Chemicals' },
    dosage: { type: String, default: '' },
    packagingSizes: { type: [String], default: ['100 gm', '250 gm', '500 gm', '1 Kg'] },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '/images/products/premium_dummy.jpg' },
    images: { type: [String], default: [] },
    status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active', index: true },
  },
  { timestamps: true }
);

// Indexes for fast relation population & lookups
SubProductSchema.index({ productId: 1, status: 1 });
SubProductSchema.index({ parentProductId: 1, status: 1 });
SubProductSchema.index({ name: 'text', shortDescription: 'text' });

export default mongoose.model<ISubProduct>('SubProduct', SubProductSchema);


