import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  name: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guests: number;
  table?: mongoose.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, default: 2 },
  table: { type: Schema.Types.ObjectId, ref: 'Table', required: false },
  status: { type: String, enum: ['pending', 'confirmed', 'canceled', 'completed'], default: 'pending' },
}, {
  timestamps: true,
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
