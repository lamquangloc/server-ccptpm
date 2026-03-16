import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  table: mongoose.Types.ObjectId;
  products: {
    product: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  phone: string;
  total: number;
  status: 'pending' | 'confirm' | 'cancel' | 'complete';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  table: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  products: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
  }],
  phone: { type: String, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirm', 'cancel', 'complete'], default: 'pending' },
}, {
  timestamps: true,
});

export default mongoose.model<IOrder>('Order', OrderSchema);