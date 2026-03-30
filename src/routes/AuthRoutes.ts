import express from 'express';
import { register, login, forgotPassword, resetPassword, googleLogin } from '../controllers/authController';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middlewares/auth';
import { uploadAvatar } from '../middlewares/upload';

const router = express.Router();

router.post('/register', uploadAvatar, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/google', googleLogin);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, uploadAvatar, updateProfile);

export default router;