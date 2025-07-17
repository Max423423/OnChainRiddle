const logger = require('../../infrastructure/logging/simpleLogger');

class ErrorHandler {
  static handleError(err, req, res) {
    logger.logError(err, {
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: err.message
      });
    }

    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Access denied'
      });
    }

    if (err.name === 'BlockchainError') {
      return res.status(503).json({
        success: false,
        error: 'Blockchain Service Error',
        message: 'Unable to interact with blockchain'
      });
    }

    if (err.name === 'AIServiceError') {
      return res.status(503).json({
        success: false,
        error: 'AI Service Error',
        message: 'Unable to generate content with AI'
      });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      error: 'Application Error',
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
      timestamp: new Date().toISOString()
    });
  }

  static handleNotFound(req, res, next) {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
  }

  static handleAsync(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandler; 