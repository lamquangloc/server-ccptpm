import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { uploadProductImage } from '../middlewares/upload';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, requireAdmin, uploadProductImage, createProduct);
router.put('/:id', authenticateToken, requireAdmin, uploadProductImage, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export default router;