const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid resource ID.');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(400, `A record with this ${field} already exists.`);
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, 'Validation error', messages);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
