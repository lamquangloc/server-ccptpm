import mongoose, { Document, Schema } from 'mongoose';

export interface ITable extends Document {
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema: Schema = new Schema({
  number: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
}, {
  timestamps: true,
});

export default mongoose.model<ITable>('Table', TableSchema);