const logger = require('../utils/logger');

/**
 * Global error handling middleware.
 * Catches errors thrown anywhere in the application and returns a safe response.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code) {
    switch (err.code) {
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        break;
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid relation reference';
        break;
      case 'P2014':
        statusCode = 400;
        message = 'Invalid operation';
        break;
    }
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Unauthorized: invalid or expired token';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
  }

  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method}`);

  res.status(statusCode).json({ success: false, message });
}

/**
 * Catch 404 errors for unknown routes.
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
