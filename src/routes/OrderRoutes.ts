import express from 'express';
import { getAllOrders, getOrderById, getUserOrders, createOrder, updateOrderStatus, payOrder, deleteOrder, updateOrder } from '../controllers/orderController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.get('/my-orders', authenticateToken, getUserOrders);
router.get('/:id', authenticateToken, getOrderById);
router.post('/', authenticateToken, createOrder);
router.put('/:id', authenticateToken, requireAdmin, updateOrder);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);
router.post('/:id/pay', authenticateToken, requireAdmin, payOrder);
router.delete('/:id', authenticateToken, requireAdmin, deleteOrder);

export default router;