const jwt = require('jsonwebtoken');

// Mock middleware for JWT verification
const verifyToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // For development, accept any token that looks like a JWT
    if (token.includes('.') && token.split('.').length === 3) {
      // Mock JWT verification - just decode without verification for development
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      req.user = { userId: payload.userId || '1' };
      next();
    } else {
      // Fallback for simple tokens
      req.user = { userId: '1' };
      next();
    }
  } catch (error) {
    // For development, just pass through with a default user
    req.user = { userId: '1' };
    next();
  }
};

// Mock authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    // For now, just pass through - in real app, check user role
    next();
  };
};

module.exports = {
  verifyToken,
  authorize
};
