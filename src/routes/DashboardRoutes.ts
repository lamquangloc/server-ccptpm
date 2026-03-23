import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticateToken as any, requireAdmin as any, getDashboardStats as any);

export default router;
