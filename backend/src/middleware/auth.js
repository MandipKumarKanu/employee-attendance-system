const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) {
      throw new ApiError(401, 'User not found. Token is invalid.');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired.'));
    }
    next(error);
  }
};

module.exports = auth;
