import { Router } from 'express';
import {
  getSubProducts,
  getSubProductById,
  getSubProductsByProductId,
  createSubProduct,
  updateSubProduct,
  deleteSubProduct,
} from '../controllers/subProductController';

const router = Router();

router.get('/', getSubProducts);
router.get('/by-product/:productId', getSubProductsByProductId);
router.get('/:id', getSubProductById);
router.post('/', createSubProduct);
router.put('/:id', updateSubProduct);
router.delete('/:id', deleteSubProduct);

export default router;
