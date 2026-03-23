import { Response } from 'express';
import Order from '../models/Order';
import Table from '../models/Table';
import { AuthRequest } from '../middlewares/auth';

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate('user').populate('table').populate('products.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('user').populate('table').populate('products.product');
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const orders = await Order.find({ user: req.user._id })
      .populate('table')
      .populate('products.product')
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { table, products, phone } = req.body;
    const user = req.user._id;

    // Calculate total
    let total = 0;
    for (const item of products) {
      // TODO: Get product price from database
      total += item.quantity * 100; // Placeholder
    }

    const order = new Order({ user, table, products, total, phone });
    await order.save();

    // Update table status to occupied
    await Table.findByIdAndUpdate(table, { status: 'occupied' });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // If order is complete or cancel, free the table
    if (status === 'complete' || status === 'cancel') {
      await Table.findByIdAndUpdate(order.table, { status: 'available' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};