import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Category from '../models/Category';
import Table from '../models/Table';
import Order from '../models/Order';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [userCount, productCount, categoryCount, tableCount, orderCount, recentOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Table.countDocuments(),
      Order.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name').populate('table', 'number')
    ]);

    res.json({
      stats: {
        users: userCount,
        products: productCount,
        categories: categoryCount,
        tables: tableCount,
        orders: orderCount
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};