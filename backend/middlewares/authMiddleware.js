import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Consultant from '../models/Consultant.js';
import Client from '../models/Client.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (split "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user in database and attach to request context (excluding password)
      let user = null;
      if (decoded.role === 'admin' || decoded.role === 'department-admin' || decoded.role === 'crm-admin') {
        user = await Admin.findById(decoded.userId).select('-password');
      } else if (decoded.role === 'consultant') {
        user = await Consultant.findById(decoded.userId).select('-password');
      } else if (decoded.role === 'client') {
        user = await Client.findById(decoded.userId).select('-password');
      } else {
        // Fallback sequentially in case of missing role claim
        user = await Client.findById(decoded.userId).select('-password') ||
               await Consultant.findById(decoded.userId).select('-password') ||
               await Admin.findById(decoded.userId).select('-password');
      }
      
      req.user = user;
      
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authorized, user no longer exists',
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized, your account is deactivated',
        });
      }

      next();
    } catch (error) {
      console.error('JWT Verification error:', error.message);
      res.status(401).json({
        status: 'error',
        message: 'Not authorized, token expired or invalid',
      });
    }
  }

  if (!token) {
    res.status(401).json({
      status: 'error',
      message: 'Not authorized, no authorization token provided',
    });
  }
};
