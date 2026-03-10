import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../interfaces/base.js';
import { env } from '../config/env.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  console.error('Unhandled error:', err);

  res.status(500).json({
    error: 'InternalServerError',
    message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    statusCode: 500,
  });
}
