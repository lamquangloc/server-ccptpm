import express from 'express';
import { register, login, getProfile, forgotPassword, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { uploadAvatar } from '../middlewares/upload';

const router = express.Router();

router.post('/register', uploadAvatar, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, uploadAvatar, updateProfile);

export default router;