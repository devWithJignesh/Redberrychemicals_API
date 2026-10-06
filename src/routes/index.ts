import { Router } from 'express';
import productRoutes from './productRoutes';
import subProductRoutes from './subProductRoutes';
import inquiryRoutes from './inquiryRoutes';
import uploadRoutes from './uploadRoutes';
import authRoutes from './authRoutes';
import reviewRoutes from './reviewRoutes';
import { seedDatabaseHandler } from '../controllers/seedController';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/sub-products', subProductRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/reviews', reviewRoutes);
router.use('/upload', uploadRoutes);
router.post('/seed', seedDatabaseHandler);
router.get('/seed', seedDatabaseHandler);

export default router;
