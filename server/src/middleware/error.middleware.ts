import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging (with stack trace in development)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  } else {
    // In production, log without exposing sensitive details
    console.error('Error:', {
      message: err.message,
      code: err.code,
      status: err.status,
    });
  }

  // Determine status code
  const status = err.status || 500;
  
  // Determine error code
  const code = err.code || 'INTERNAL_ERROR';
  
  // Determine message (hide internal errors in production)
  let message = err.message || 'Internal server error';
  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }

  // Return consistent JSON error response
  res.status(status).json({
    error: {
      message,
      code,
      status,
    },
  });
};
