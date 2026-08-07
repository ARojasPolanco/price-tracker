import { AppError } from "./appError.js";

const handleSequelizeUniqueConstraintError = (err) => {
  const fields = Object.keys(err.fields).join(", ");
  return new AppError(`The field '${fields}' already exists.`, 400);
};

const handleSequelizeValidationError = (err) => {
  const messages = err.errors.map((e) => e.message).join(". ");
  return new AppError(messages, 400);
};

// eslint-disable-next-line no-unused-vars
const handleZodError = (err, req) => {
  const issues = err.issues || err.errors || [];
  const messages = issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  return new AppError(messages || "Validation failed", 422);
};

const errorMatchers = [
  {
    test: (e) => e.name === "SequelizeUniqueConstraintError",
    handle: handleSequelizeUniqueConstraintError,
  },
  {
    test: (e) => e.name === "SequelizeValidationError",
    handle: handleSequelizeValidationError,
  },
  { test: (e) => e.name === "ZodError", handle: handleZodError },
];

export default errorMatchers;
