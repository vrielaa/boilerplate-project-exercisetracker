export const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

export const badRequest = (message) => createHttpError(400, message);

export const notFound = (message) => createHttpError(404, message);
