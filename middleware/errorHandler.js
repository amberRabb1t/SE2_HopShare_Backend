import { ERROR_CODES, AppError } from '../config/constants.js';
import { sendError } from '../utils/responses.js';

/**
 * Not Found handler
 * @type {import('express').RequestHandler}
 */
export function notFoundHandler(_req, res) {
  return sendError(res, 'Resource not found', ERROR_CODES.NOT_FOUND, 404);
}

/**
 * Centralized error handler that differentiates error types.
 * @type {import('express').ErrorRequestHandler}
 */
export function errorHandler(err, _req, res, _next) {
  // Known AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.code, err.statusCode, err);
  }

  // Joi validation error
  if (err && err.isJoi) {
    return sendError(res, err.message, ERROR_CODES.VALIDATION_ERROR, 400, err);
  }

  // Mongoose validation or cast errors
  if (err && (err.name === 'ValidationError' || err.name === 'CastError')) {
    return sendError(res, err.message, ERROR_CODES.VALIDATION_ERROR, 400, err);
  }

  // Mongo or database errors
  if (err && (err.name === 'MongoError' || err.name === 'MongoServerError')) {
    return sendError(res, err.message, ERROR_CODES.DB_ERROR, 500, err);
  }

  // Default: internal error
  console.error('[ERROR]', err);
  return sendError(res, 'Internal server error', ERROR_CODES.INTERNAL_ERROR, 500, err);
}