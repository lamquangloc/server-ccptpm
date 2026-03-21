import { Response } from 'express';
import Table from '../models/Table';
import { AuthRequest } from '../middlewares/auth';

export const getAllTables = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTableById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { number, capacity } = req.body;

    // Validate required fields
    if (number === undefined || number === null || capacity === undefined || capacity === null) {
      res.status(400).json({ message: 'number và capacity là bắt buộc.' });
      return;
    }

    const table = new Table({ number: Number(number), capacity: Number(capacity) });
    await table.save();
    res.status(201).json(table);
  } catch (error: any) {
    // MongoDB duplicate key error code
    if (error.code === 11000) {
      res.status(400).json({ message: `Bàn số ${req.body.number} đã tồn tại.` });
      return;
    }
    console.error('[createTable] error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { number, capacity, status } = req.body;

    // Build update object with only provided fields (avoid overwriting required fields with undefined)
    const updateFields: Record<string, any> = {};
    if (number   !== undefined) updateFields.number   = Number(number);
    if (capacity !== undefined) updateFields.capacity = Number(capacity);
    if (status   !== undefined) updateFields.status   = status;

    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({ message: 'Không có trường nào cần cập nhật.' });
      return;
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!table) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }
    res.json(table);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: `Số bàn đã được sử dụng bởi bàn khác.` });
      return;
    }
    console.error('[updateTable] error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};