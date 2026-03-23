import express from 'express';
import { register, login, forgotPassword } from '../controllers/authController';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middlewares/auth';
import { uploadAvatar } from '../middlewares/upload';

const router = express.Router();

router.post('/register', uploadAvatar, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, uploadAvatar, updateProfile);

export default router;