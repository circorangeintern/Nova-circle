// Catches errors thrown/passed via next(err) in any route and returns a
// consistent JSON error shape across the whole API.
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'MulterError' || err.message === 'Only JPEG, PNG, or WEBP images are allowed') {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: err.code === 'LIMIT_FILE_SIZE'
        ? 'Photo must be 5MB or smaller'
        : err.message,
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'One or more fields are invalid',
      details: err.errors,
    });
  }

  if (err.code === 'P2002') {
    // Prisma unique constraint violation
    return res.status(409).json({
      error: 'DUPLICATE_ENTRY',
      message: `A record with this ${err.meta?.target?.join(', ')} already exists`,
    });
  }

  if (err.code === 'P2025') {
    // Prisma record not found
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: 'The requested resource was not found',
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.errorCode || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Something went wrong',
  });
}

module.exports = errorHandler;
