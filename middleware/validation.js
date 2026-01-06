import { AppError, ERROR_CODES } from '../config/constants.js';

/**
 * Validate request parts (query/body/params) against Joi schemas.
 * @param {{ body?: import('joi').Schema, query?: import('joi').Schema, params?: import('joi').Schema }} schemas
 * @returns {import('express').RequestHandler}
 */
export function validate(schemas = {}) {
  return (req, _, next) => {
    try {
      // Validate query parameters
      if (schemas.query) {
        req.query = validateSchema(schemas.query, req.query);
      }
      // Validate URL parameters
      if (schemas.params) {
        req.params = validateSchema(schemas.params, req.params);
      }
      // Validate request body
      if (schemas.body) {
        req.body = validateSchema(schemas.body, req.body);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Generic helper function to validate data against a Joi schema
function validateSchema(schema, data) {
  const { value, error } = schema.validate(data, { abortEarly: false, convert: true });
  if (error) throw new AppError(error.message, 400, ERROR_CODES.VALIDATION_ERROR, error.details);
  return value;
}

