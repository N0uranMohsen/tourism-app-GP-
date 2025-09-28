export const globalErrorHandling = async (err, req, res, next) => {
  const code = err.statusCode || 400;
  res.status(code).json({ error: "error", message: err.message });
  next();
};

