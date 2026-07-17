import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Runs after express-validator chains; collects any validation errors
 * into the standardized error response format.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  next(ApiError.unprocessable('Validation failed', formattedErrors));
};

export default validate;
