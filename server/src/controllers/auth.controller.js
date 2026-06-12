import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../services/email.service.js';

// JWT payload requires: userId, email, role, expiry
const signToken = (user) =>
  jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'greencampus_super_secret_jwt_key_change_in_production', 
    { expiresIn: '7d' }
  );

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { collegeName, adminName, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ collegeName, adminName, email, password });
    const token = signToken(user);

    res.status(201).json({ 
      success: true, 
      message: 'Account created successfully.', 
      token, 
      user,
      data: user 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login
 * @route   POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user);
    res.json({ 
      success: true, 
      token, 
      user, 
      role: user.role,
      data: user 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email address.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Construct URL for front-end reset page
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const emailRes = await sendResetPasswordEmail(user, resetUrl);

    res.json({
      success: true,
      message: 'Password reset link sent to email.',
      previewUrl: emailRes?.previewUrl,
      token: resetToken
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password/:token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully. Please login again.'
    });
  } catch (err) {
    next(err);
  }
};
