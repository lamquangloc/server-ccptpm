import { Response } from 'express';
import Order from '../models/Order';
import Table from '../models/Table';
import Product from '../models/Product';
import { AuthRequest } from '../middlewares/auth';

const normalizeGuestsForResponse = (order: any) => {
  if (order?.guests && Number(order.guests) > 0) return order;
  const fallbackGuests = Number(order?.table?.capacity) > 0 ? Number(order.table.capacity) : 2;
  return { ...order, guests: fallbackGuests };
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate('user').populate('table').populate('products.product');
    res.json(orders.map((order) => normalizeGuestsForResponse(order.toObject())));
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
    res.json(normalizeGuestsForResponse(order.toObject()));
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
    res.json(orders.map((order) => normalizeGuestsForResponse(order.toObject())));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { table, products, phone, customerName, guests } = req.body;
    const userId = req.user?._id;

    const tableDoc = await Table.findById(table);
    if (!tableDoc) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }

    // Calculate total based on actual product prices
    let total = 0;
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404).json({ message: `Product not found: ${item.product}` });
        return;
      }
      total += product.price * item.quantity;
    }

    const normalizedGuests = Number(guests);

    const fallbackGuests = Number((tableDoc as any).capacity) > 0 ? Number((tableDoc as any).capacity) : 2;
    const finalGuests = Number.isFinite(normalizedGuests) && normalizedGuests > 0 ? normalizedGuests : fallbackGuests;

    const order = new Order({
      user: userId || undefined,
      customerName: customerName || undefined,
      table,
      products,
      total,
      phone: phone || undefined,
      guests: finalGuests,
    });
    await order.save();

    // Update table status to occupied
    await Table.findByIdAndUpdate(table, { status: 'occupied' });

    const populated = await order.populate(['table', 'products.product']);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('table');
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // If order is complete or cancel, free the table back to available
    if (status === 'complete' || status === 'cancel') {
      const tableId = (order.table as any)?._id || order.table;
      await Table.findByIdAndUpdate(tableId, { status: 'available' });
    } else if (status === 'confirm') {
      const tableId = (order.table as any)?._id || order.table;
      await Table.findByIdAndUpdate(tableId, { status: 'reserved' });
    } else if (status === 'pending') {
      const tableId = (order.table as any)?._id || order.table;
      await Table.findByIdAndUpdate(tableId, { status: 'occupied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { table, products, phone, customerName, status, guests } = req.body;
    
    // Calculate total based on actual product prices
    let total = 0;
    if (products && products.length > 0) {
      for (const item of products) {
        const product = await Product.findById(item.product);
        if (!product) {
          res.status(404).json({ message: `Product not found: ${item.product}` });
          return;
        }
        total += product.price * item.quantity;
      }
    }

    const updateFields: any = {};
    if (table) updateFields.table = table;
    if (products) updateFields.products = products;
    if (total > 0) updateFields.total = total;
    if (phone !== undefined) updateFields.phone = phone;
    if (customerName !== undefined) updateFields.customerName = customerName;
    if (guests !== undefined) {
      const normalizedGuests = Number(guests);
      if (Number.isFinite(normalizedGuests) && normalizedGuests > 0) {
        updateFields.guests = normalizedGuests;
      } else {
        res.status(400).json({ message: 'Guests must be a positive number' });
        return;
      }
    }
    if (status) updateFields.status = status;

    const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true }).populate(['table', 'products.product']);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Handle table freeing if status changed to complete/cancel
    if (status === 'complete' || status === 'cancel') {
      const tableId = (order.table as any)?._id || order.table;
      await Table.findByIdAndUpdate(tableId, { status: 'available' });
    } else if (status === 'confirm') {
      const tableId = (order.table as any)?._id || order.table;
      await Table.findByIdAndUpdate(tableId, { status: 'reserved' });
    } else if (status === 'pending') {
      const tableId = (order.table as any)?._id || order.table;
      await Table.findByIdAndUpdate(tableId, { status: 'occupied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * COD Payment: client submits the amount paid.
 * If amountPaid >= order.total, mark order as 'complete' and free the table.
 */
export const payOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amountPaid } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (typeof amountPaid !== 'number' || amountPaid < order.total) {
      res.status(400).json({
        message: `Insufficient payment. Required: ${order.total}, received: ${amountPaid}`,
      });
      return;
    }

    order.status = 'complete';
    await order.save();

    // Free the table
    await Table.findByIdAndUpdate(order.table, { status: 'available' });

    res.json({ message: 'Payment successful', order, change: amountPaid - order.total });
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