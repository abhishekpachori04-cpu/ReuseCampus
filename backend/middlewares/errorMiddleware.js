/**
 * 404 Route Not Found Middleware
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Centralized Error Handler Middleware
 * Normalizes Mongoose CastError, ValidationError, and duplicate key (11000) errors
 * into structured JSON responses with appropriate HTTP 400/404 status codes.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId / CastError (e.g., /api/listings/invalid-id)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with invalid identifier: ${err.value}`;
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  // Handle Mongoose Duplicate Key (E11000) Error
  if (err.code === 11000) {
    statusCode = 400;
    const fields = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate value entered${fields ? ` for field '${fields}'` : ''}. Please choose another value.`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
