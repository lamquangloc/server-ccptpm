import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import sendEmail from '../utils/sendEmail';
import { resetPasswordTemplate } from '../utils/emailTemplates';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const userDetails: any = { name, email, password, role };
    if (req.file) {
      userDetails.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = new User(userDetails);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1d' });

    res.status(201).json({ message: 'User registered successfully', token, user: { id: user._id, name, email, role, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1d' });

    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email, role: user.role, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    const updateData: any = { name };
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Vui lòng nhập địa chỉ email.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found (security: don't reveal user existence)
      res.json({ message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' });
      return;
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Build reset URL pointing to frontend
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: '🔑 Đặt lại mật khẩu - CCVMTPTPM Restaurant',
      html: resetPasswordTemplate(resetUrl, user.name),
    });

    res.json({ message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Không thể gửi email. Vui lòng thử lại sau.' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
      return;
    }

    // Hash the token from URL and find matching user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.' });
      return;
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập ngay.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại.' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ message: 'No token provided' });
      return;
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      res.status(400).json({ message: 'Invalid Google token' });
      return;
    }

    const userInfo = await response.json() as any;
    const email = userInfo.email;
    const name = userInfo.name;

    if (!email) {
      res.status(400).json({ message: 'Google account has no email' });
      return;
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        name: name || 'Google User', 
        email, 
        password: Math.random().toString(36).slice(-10) + 'A1!', 
        role: 'user' 
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1d' });

    res.json({ message: 'Google login successful', token: jwtToken, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during Google login', error });
  }
};