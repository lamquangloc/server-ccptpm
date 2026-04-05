import express from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookingController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, getAllBookings);
router.get('/:id', authenticateToken, requireAdmin, getBookingById);
router.post('/', createBooking); // Public: customers can book
router.put('/:id', authenticateToken, requireAdmin, updateBookingStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteBooking);

export default router;
