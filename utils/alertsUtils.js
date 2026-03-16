const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validatePositiveInt = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createError(`Invalid ${fieldName}`, 400);
  }
  return parsed;
};

module.exports = {
  createError,
  validatePositiveInt,
};
