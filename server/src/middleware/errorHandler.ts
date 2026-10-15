import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Prisma errors
  if ((err as any).code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
    });
  }

  console.error('Unhandled error:', err);

  const message = env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;

  return res.status(500).json({
    success: false,
    message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}
