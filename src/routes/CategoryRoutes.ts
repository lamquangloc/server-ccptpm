import express from 'express';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { uploadCategoryImage } from '../middlewares/upload';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticateToken, requireAdmin, uploadCategoryImage, createCategory);
router.put('/:id', authenticateToken, requireAdmin, uploadCategoryImage, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

export default router;