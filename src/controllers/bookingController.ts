import { Response, Request } from 'express';
import Booking from '../models/Booking';
import { AuthRequest } from '../middlewares/auth';

export const getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find().populate('table').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id).populate('table');
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, date, time, guests, table } = req.body;
    const booking = new Booking({ name, phone, date, time, guests, table });
    await booking.save();
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, table } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    booking.status = status || booking.status;
    if (table) booking.table = table;

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
