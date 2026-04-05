import express from 'express';
import {
  getAllBookings,
  getBookingById,
  getMyBookings,
  createBooking,
  updateBookingStatus,
  cancelMyBooking,
  deleteBooking,
} from '../controllers/bookingController';
import { authenticateToken, requireAdmin, optionalAuth } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, getAllBookings);
router.get('/my-bookings', authenticateToken, getMyBookings);
router.get('/:id', authenticateToken, requireAdmin, getBookingById);
router.post('/', optionalAuth, createBooking); // Public: có thể đặt không cần login, nhưng gắn userId nếu đăng nhập
router.put('/:id', authenticateToken, requireAdmin, updateBookingStatus);
router.post('/:id/cancel', authenticateToken, cancelMyBooking);
router.delete('/:id', authenticateToken, requireAdmin, deleteBooking);

export default router;
