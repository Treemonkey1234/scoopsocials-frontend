import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { RateLimitError } from './errorHandler';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

// Rate limit configurations
const RATE_LIMITS = {
  HIGH_TRUST: { windowMs: 60000, max: 100 },    // 100 requests per minute
  MEDIUM_TRUST: { windowMs: 60000, max: 50 },   // 50 requests per minute
  LOW_TRUST: { windowMs: 60000, max: 20 },      // 20 requests per minute
  DEFAULT: { windowMs: 60000, max: 10 }         // 10 requests per minute
};

// Get rate limit based on user trust score
const getRateLimit = (trustScore: number) => {
  if (trustScore >= 80) return RATE_LIMITS.HIGH_TRUST;
  if (trustScore >= 50) return RATE_LIMITS.MEDIUM_TRUST;
  if (trustScore >= 20) return RATE_LIMITS.LOW_TRUST;
  return RATE_LIMITS.DEFAULT;
};

// Check rate limit for a specific key
const checkRateLimit = async (key: string, windowMs: number, max: number): Promise<boolean> => {
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, Math.floor(windowMs / 1000));
  }
  
  return current <= max;
};

// Dynamic rate limit middleware
export const dynamicRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    let rateLimit = RATE_LIMITS.DEFAULT;
    
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { trustScore: true }
      });
      
      if (user) {
        rateLimit = getRateLimit(user.trustScore);
      }
    }
    
    const key = `ratelimit:${userId || req.ip}`;
    const allowed = await checkRateLimit(key, rateLimit.windowMs, rateLimit.max);
    
    if (!allowed) {
      throw new RateLimitError('Too many requests. Please try again later.');
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimit.max);
    res.setHeader('X-RateLimit-Window', rateLimit.windowMs);
    
    next();
  } catch (error) {
    next(error);
  }
};

// Specific rate limit for authentication endpoints
export const authRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = `auth:${req.ip}`;
    const allowed = await checkRateLimit(key, 300000, 5); // 5 attempts per 5 minutes
    
    if (!allowed) {
      throw new RateLimitError('Too many authentication attempts. Please try again later.');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Rate limit for sensitive operations
export const sensitiveRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const key = `sensitive:${userId || req.ip}`;
    const allowed = await checkRateLimit(key, 3600000, 10); // 10 attempts per hour
    
    if (!allowed) {
      throw new RateLimitError('Too many sensitive operations. Please try again later.');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

export const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = `ratelimit:${req.ip}`;
    const limit = 100; // requests
    const window = 60; // seconds

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, window);
    }

    if (current > limit) {
      throw new AppError(429, 'RATE_LIMIT_EXCEEDED', [{ message: 'Too many requests' }]);
    }

    next();
  } catch (error) {
    next(error);
  }
}; 