import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: string;
  productCount: number;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  productCount: { type: Number, default: 0 },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
}, {
  timestamps: true,
});

export default mongoose.model<ICategory>('Category', CategorySchema);