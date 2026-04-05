import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  categories: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 20 },
  image: { type: String },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
}, {
  timestamps: true,
});

export default mongoose.model<IProduct>('Product', ProductSchema);