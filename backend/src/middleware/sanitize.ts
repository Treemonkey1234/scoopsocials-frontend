import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

// Sanitization options
const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  allowedIframeHostnames: []
};

// Sanitize string input
export const sanitizeString = (input: string): string => {
  return sanitizeHtml(input, sanitizeOptions);
};

// Sanitize object recursively
export const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Middleware to sanitize request body
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Middleware to sanitize request query
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
};

// Middleware to sanitize request params
export const sanitizeParams = (req: Request, res: Response, next: NextFunction) => {
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// Combined sanitization middleware
export const sanitizeAll = (req: Request, res: Response, next: NextFunction) => {
  sanitizeBody(req, res, () => {
    sanitizeQuery(req, res, () => {
      sanitizeParams(req, res, next);
    });
  });
}; 