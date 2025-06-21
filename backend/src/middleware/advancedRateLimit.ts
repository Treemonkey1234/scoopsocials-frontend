import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import { AppError } from '../utils/AppError';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export class AdvancedRateLimit {
  private windowMs: number;
  private max: number;
  private message: string;

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.message = options.message || 'Too many requests, please try again later.';
  }

  async checkLimit(req: Request, res: Response, next: NextFunction) {
    try {
      const key = `ratelimit:${req.ip}`;
      const now = Date.now();
      const windowKey = `${key}:${Math.floor(now / this.windowMs)}`;

      const client = await redis.duplicate();
      await client.connect();

      const count = await client.incr(windowKey);
      const ttl = await client.pTTL(windowKey);

      if (count > this.max) {
        const resetTime = new Date(now + (ttl || this.windowMs));
        res.setHeader('X-RateLimit-Limit', this.max.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', resetTime.toISOString());
        throw new AppError(429, 'RATE_LIMIT_EXCEEDED', [{ message: this.message }]);
      }

      res.setHeader('X-RateLimit-Limit', this.max.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - count).toString());
      res.setHeader('X-RateLimit-Reset', new Date(now + this.windowMs).toISOString());

      await client.quit();
      next();
    } catch (error) {
      next(error);
    }
  }
}

export const createRateLimit = (options: RateLimitOptions) => {
  const limiter = new AdvancedRateLimit(options);
  return limiter.checkLimit.bind(limiter);
};

// Rate limiters for different endpoints
export const authLimiter = createRateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many login attempts, please try again later.' });
export const signupLimiter = createRateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: 'Too many signup attempts, please try again later.' });
export const verificationLimiter = createRateLimit({ windowMs: 15 * 60 * 1000, max: 3, message: 'Too many verification attempts, please try again later.' });
export const passwordResetLimiter = createRateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: 'Too many password reset attempts, please try again later.' });
export const apiLimiter = createRateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests, please try again later.' });
export const sensitiveApiLimiter = createRateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many sensitive operations, please try again later.' });