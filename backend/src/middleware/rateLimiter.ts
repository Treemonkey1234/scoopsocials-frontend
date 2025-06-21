import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

const WINDOW_SIZE = 60; // 1 minute window
const MAX_REQUESTS = 100; // Maximum requests per window

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = `rate-limit:${req.ip}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, WINDOW_SIZE);
    }

    if (current > MAX_REQUESTS) {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: await redis.pTTL(key)
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - current));
    res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + WINDOW_SIZE);

    next();
  } catch (error) {
    logger.error('Rate limiter error:', error);
    next(); // Continue without rate limiting if Redis fails
  }
}; 