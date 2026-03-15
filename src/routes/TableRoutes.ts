import express from 'express';
import { getAllTables, getTableById, createTable, updateTable, deleteTable } from '../controllers/tableController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = express.Router();

router.get('/', getAllTables);
router.get('/:id', getTableById);
router.post('/', authenticateToken, requireAdmin, createTable);
router.put('/:id', authenticateToken, requireAdmin, updateTable);
router.delete('/:id', authenticateToken, requireAdmin, deleteTable);

export default router;