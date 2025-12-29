import { ERROR_CODES, AppError } from '../config/constants.js';
import { sendError } from '../utils/responses.js';

/**
 * Not Found handler
 * @type {import('express').RequestHandler}
 */
export function notFoundHandler(_req, res) {
  return sendError(res, ERROR_CODES.NOT_FOUND, 404, { message: 'Resource not found' });
}

/**
 * Centralized error handler that differentiates error types.
 * @type {import('express').ErrorRequestHandler}
 */
export function errorHandler(err, _req, res, _next) {
  // Known AppError
  if (err instanceof AppError) {
    return sendError(res, err.code, err.statusCode, err);
  }
  if (err) {
    // Joi/Mongoose validation or cast errors
    if (err.isJoi || err.name === 'ValidationError' || err.name === 'CastError') {
      return sendError(res, ERROR_CODES.VALIDATION_ERROR, 400, err);
    }
    // Mongo or database errors
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      return sendError(res, ERROR_CODES.DB_ERROR, 500, err);
    }
  }
  // Default: internal error
  console.error('[ERROR]', err);
  return sendError(res, ERROR_CODES.INTERNAL_ERROR, 500, err);
}

