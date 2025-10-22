const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
exports.authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'algo-royale-secret-key-change-in-production'
    );

    // Get user from database
    const user = await User.findById(decoded.id).select('-__v');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Update last active
    user.lastActive = Date.now();
    await user.save();

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'algo-royale-secret-key-change-in-production'
      );
      const user = await User.findById(decoded.id).select('-__v');
      if (user) {
        user.lastActive = Date.now();
        await user.save();
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
