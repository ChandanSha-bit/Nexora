// Fallback route for URLs that do not exist (404)
export const notFound = (req, res, next) => {
  const error = new Error(`Endpoint Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Passes the error to the global handler below
};

// Global Error Handler wrapper
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Gracefully handle bad MongoDB Object IDs
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found in database';
  }

  res.status(statusCode).json({
    message: message,
    // Provide verbose stack traces ONLY inside development environments
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
