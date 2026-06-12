import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('collegeName', 'College Name is required').notEmpty(),
    body('adminName', 'Admin Name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 8 or more characters').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  register
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  login
);

router.post(
  '/forgot-password',
  [
    body('email', 'Please include a valid email').isEmail(),
  ],
  forgotPassword
);

router.post(
  '/reset-password/:token',
  [
    body('password', 'Password must be 8 or more characters').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  resetPassword
);

router.get('/me', protect, getMe);

export default router;
