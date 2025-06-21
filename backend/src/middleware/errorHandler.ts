import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

export class ValidationError extends AppError {
  constructor(errors: { message: string }[]) {
    super(400, 'Validation Error', errors);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, 'Not Found', [{ message }]);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, 'Unauthorized', [{ message }]);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, 'Forbidden', [{ message }]);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, 'Rate Limit Exceeded', [{ message }]);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle CORS errors
  if (err.name === 'CORSError') {
    return res.status(403).json({
      status: 'error',
      code: 'CORS_ERROR',
      message: 'CORS error: Request not allowed',
      details: [{ message: err.message }]
    });
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        code: 'DUPLICATE_ENTRY',
        message: 'A record with this value already exists',
        details: [{ message: err.message }]
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Record not found',
        details: [{ message: err.message }]
      });
    }
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      details: err.details
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Invalid token',
      details: [{ message: err.message }]
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      code: 'TOKEN_EXPIRED',
      message: 'Token expired',
      details: [{ message: err.message }]
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      details: [{ message: err.message }]
    });
  }

  // Handle rate limit errors
  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
      details: [{ message: err.message }]
    });
  }

  // Default error
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
    details: [{ message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred' }]
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
};

export class ConflictError extends Error {
  statusCode = 409;
  code = 'CONFLICT';
  
  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ServiceUnavailableError extends Error {
  statusCode = 503;
  code = 'SERVICE_UNAVAILABLE';
  
  constructor(message: string = 'Service temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}