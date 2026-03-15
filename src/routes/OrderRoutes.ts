import express from 'express';
import { getAllOrders, getOrderById, getUserOrders, createOrder, updateOrderStatus, deleteOrder } from '../controllers/orderController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.get('/my-orders', authenticateToken, getUserOrders);
router.get('/:id', authenticateToken, getOrderById);
router.post('/', authenticateToken, createOrder);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteOrder);

export default router;