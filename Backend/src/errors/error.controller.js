import errorMatchers from "./errorMatchers.js";

const sendErrorDev = (err, req, res) => {
  console.error(err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, req, res) => {
  console.error(err);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, req, res);
  }

  const matcher = errorMatchers.find((m) => m.test(err));
  const error = matcher ? matcher.handle(err, req) : err;
  sendErrorProd(error, req, res);
};
