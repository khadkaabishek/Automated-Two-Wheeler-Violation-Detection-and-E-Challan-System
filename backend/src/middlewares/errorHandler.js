import { Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Converts known error types (Prisma, express-validator, JWT, Multer, etc.)
 * into a consistent ApiError before the final handler formats the response.
 */
// eslint-disable-next-line no-unused-vars
export const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = 500;
    let message = error.message || 'Internal Server Error';
    let errors = null;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          const target = error.meta?.target?.join(', ') || 'field';
          statusCode = 409;
          message = `A record with this ${target} already exists`;
          break;
        }
        case 'P2025':
          statusCode = 404;
          message = 'Requested record was not found';
          break;
        case 'P2003':
          statusCode = 400;
          message = 'Invalid reference to a related record';
          break;
        default:
          statusCode = 400;
          message = 'Database request error';
      }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      statusCode = 400;
      message = 'Invalid data provided to database query';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      statusCode = 400;
      message = 'Uploaded file exceeds the maximum allowed size';
    } else if (error.name === 'MulterError') {
      statusCode = 400;
      message = error.message;
    }

    error = new ApiError(statusCode, message, errors, false);
  }

  next(error);
};

/**
 * Final error handler: logs the error and sends the standardized JSON response.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message, errors } = err;

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${message}\n${err.stack}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: errors || null,
    ...(env.isDevelopment && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
