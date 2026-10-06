import { Router } from 'express';
import {
  getInquiries,
  getInquiryById,
  createInquiry,
  updateInquiry,
  deleteInquiry,
} from '../controllers/inquiryController';

const router = Router();

router.get('/', getInquiries);
router.get('/:id', getInquiryById);
router.post('/', createInquiry);
router.put('/:id', updateInquiry);
router.delete('/:id', deleteInquiry);

export default router;
