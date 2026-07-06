export const errorHandler = (error, req, res, next) => {
  const status = error.statusCode || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : error.message,
  });
};
