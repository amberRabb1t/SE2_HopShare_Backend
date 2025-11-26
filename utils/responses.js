import { RESPONSE_SHAPE } from '../config/constants.js';

/**
 * Send a success JSON response with standardized shape.
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} [message]
 * @param {number} [status=200]
 */
export function sendSuccess(res, data, message = 'OK', status = 200) {
  return res.status(status).json({
    ...RESPONSE_SHAPE,
    success: true,
    data,
    message,
    error: null
  });
}

/**
 * Send an error JSON response with standardized shape.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {string|null} code
 * @param {number} [status=500]
 * @param {any} [error=null]
 */
export function sendError(res, message, code = null, status = 500, error = null) {
  return res.status(status).json({
    ...RESPONSE_SHAPE,
    success: false,
    data: null,
    message,
    error: code || error?.name || 'ERROR'
  });
}