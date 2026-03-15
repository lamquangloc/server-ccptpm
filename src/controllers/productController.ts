import { Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { AuthRequest } from '../middlewares/auth';

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find().populate('categories');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('categories');
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, categories } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const product = new Product({ name, description, price, image, categories });
    await product.save();

    // Update productCount in categories
    if (categories && categories.length > 0) {
      await Category.updateMany({ _id: { $in: categories } }, { $inc: { productCount: 1 } });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, categories } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData: any = { name, description, price, categories };
    if (image) updateData.image = image;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Update productCount in categories
    if (product.categories && product.categories.length > 0) {
      await Category.updateMany({ _id: { $in: product.categories } }, { $inc: { productCount: -1 } });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};