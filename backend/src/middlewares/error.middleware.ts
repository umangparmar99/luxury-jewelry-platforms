import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handling Prisma Known Request Errors
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        message = `Unique constraint violation. A record with this ${target} already exists.`;
        break;
      }
      case 'P2025':
        statusCode = 404;
        message = 'Requested record was not found.';
        break;
      default:
        statusCode = 400;
        message = `Database operation error: ${err.message}`;
    }
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please sign in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication session has expired. Please sign in again.';
  }

  // Log non-operational errors for debugging
  if (statusCode === 500) {
    console.error('[Unhandled Server Error]', err);
  } else if (process.env.NODE_ENV === 'development') {
    console.warn(`[Operational Warning] ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
