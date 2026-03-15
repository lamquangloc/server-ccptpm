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
    const table = new Table({ number, capacity });
    await table.save();
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { number, capacity, status } = req.body;
    const table = await Table.findByIdAndUpdate(req.params.id, { number, capacity, status }, { new: true });
    if (!table) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
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