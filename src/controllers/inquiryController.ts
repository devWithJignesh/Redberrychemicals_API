import { Request, Response } from 'express';
import inquiryService from '../services/inquiryService';
import { sendSuccess, sendError } from '../helpers/responseHelper';

export const getInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const inquiries = await inquiryService.getAllInquiries(filter);
    sendSuccess(res, inquiries, 'Inquiries fetched successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const getInquiryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const inquiry = await inquiryService.getInquiryById(req.params.id);
    if (!inquiry) {
      sendError(res, 'Inquiry not found', 404);
      return;
    }
    sendSuccess(res, inquiry, 'Inquiry fetched successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

export const createInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !message) {
      sendError(res, 'Name, email, and message are required fields', 400);
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      message: message.trim(),
      status: 'Pending' as const,
    };

    const inquiry = await inquiryService.createInquiry(payload);
    sendSuccess(res, inquiry, 'Inquiry submitted successfully', 201);
  } catch (error) {
    sendError(res, (error as Error).message, 400);
  }
};

export const updateInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message, status } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (message !== undefined) updateData.message = message.trim();
    if (status !== undefined) updateData.status = status;

    const inquiry = await inquiryService.updateInquiry(req.params.id, updateData);
    if (!inquiry) {
      sendError(res, 'Inquiry not found', 404);
      return;
    }
    sendSuccess(res, inquiry, 'Inquiry updated successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 400);
  }
};

export const deleteInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const inquiry = await inquiryService.deleteInquiry(req.params.id);
    if (!inquiry) {
      sendError(res, 'Inquiry not found', 404);
      return;
    }
    sendSuccess(res, null, 'Inquiry deleted successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};
