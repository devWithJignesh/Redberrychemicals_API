import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    message: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  },
  { timestamps: true }
);

InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1 });

export default mongoose.model<IInquiry>('Inquiry', InquirySchema);
