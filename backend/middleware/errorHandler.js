// Central error handler. Never leaks stack traces or internal details to
// the client; logs the full error server-side for debugging.
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.isApiError ? err.statusCode : 500;
  const message = err.isApiError
    ? err.message
    : 'Something went wrong on our end. Please try again shortly.';

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
};
