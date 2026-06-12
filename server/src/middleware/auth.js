import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'greencampus_super_secret_jwt_key_change_in_production');
      req.user = await User.findById(decoded.userId);
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'No user found with this ID' });
      }
      
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
  } catch (err) {
    next(err);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role || 'none'} is not authorized to access this route`,
      });
    }
    next();
  };
};
