import { ValidationError } from '../utils/ValidationError.js'

export function errorHandler(err, req, res, next) {
  const statusCode =
    err instanceof ValidationError
      ? 400
      : err.statusCode && err.statusCode >= 400
        ? err.statusCode
        : 500

  if (statusCode === 500) {
    console.error(err)
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 ? 'Something went wrong on the server.' : err.message,
  })
}
