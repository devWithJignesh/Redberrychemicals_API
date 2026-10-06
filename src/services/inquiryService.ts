import mongoose from 'mongoose';
import Inquiry, { IInquiry } from '../models/Inquiry';

export class InquiryService {
  async getAllInquiries(filter: object = {}): Promise<IInquiry[]> {
    return await Inquiry.find(filter).sort({ createdAt: -1 });
  }

  async getInquiryById(id: string): Promise<IInquiry | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
    return await Inquiry.findById(id);
  }

  async createInquiry(data: Partial<IInquiry>): Promise<IInquiry> {
    const inquiry = new Inquiry(data);
    return await inquiry.save();
  }

  async updateInquiry(id: string, data: Partial<IInquiry>): Promise<IInquiry | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
    return await Inquiry.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteInquiry(id: string): Promise<IInquiry | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
    return await Inquiry.findByIdAndDelete(id);
  }
}

export default new InquiryService();
