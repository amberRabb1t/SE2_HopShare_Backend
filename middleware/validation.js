import { AppError, ERROR_CODES } from '../config/constants.js';

/**
 * Validate request parts (query/body/params) against Joi schemas.
 * @param {{ body?: import('joi').Schema, query?: import('joi').Schema, params?: import('joi').Schema }} schemas
 * @returns {import('express').RequestHandler}
 */
export function validate(schemas = {}) {
  return (req, _res, next) => {
    try {
      if (schemas.query) {
        const { value, error } = schemas.query.validate(req.query, { abortEarly: false, convert: true });
        if (error) throw new AppError(error.message, 400, ERROR_CODES.VALIDATION_ERROR, error.details);
        req.query = value;
      }
      if (schemas.params) {
        const { value, error } = schemas.params.validate(req.params, { abortEarly: false, convert: true });
        if (error) throw new AppError(error.message, 400, ERROR_CODES.VALIDATION_ERROR, error.details);
        req.params = value;
      }
      if (schemas.body) {
        const { value, error } = schemas.body.validate(req.body, { abortEarly: false, convert: true });
        if (error) throw new AppError(error.message, 400, ERROR_CODES.VALIDATION_ERROR, error.details);
        req.body = value;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}