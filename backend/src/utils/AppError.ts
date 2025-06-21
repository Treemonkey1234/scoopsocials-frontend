export class AppError extends Error {
  statusCode: number;
  status: string;
  code: string;
  details: { message: string }[];
  isOperational: boolean;

  constructor(statusCode: number, code: string, details: { message: string }[] = []) {
    super(code);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
} 