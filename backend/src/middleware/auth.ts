import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';
import { verifyAccessToken } from '../utils/tokenUtils';
import env from '../config/environment';
import { redis } from '../config/redis';
import { logAuthEvent } from '../utils/logger';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    phone: string;
    accountType: string;
    trustScore: number;
  };
}

interface TokenError extends Error {
  name: string;
  message: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', [{ message: 'No token provided' }]);
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        accountType: true,
        trustScore: true
      }
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', [{ message: 'User not found' }]);
    }

    req.user = {
      id: user.id,
      email: user.email || undefined,
      phone: user.phone,
      accountType: user.accountType,
      trustScore: user.trustScore
    };
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user has specific account type
export const requireAccountType = (requiredTypes: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!requiredTypes.includes(req.user.accountType)) {
      return res.status(403).json({ 
        error: `Account type ${req.user.accountType} not authorized. Required: ${requiredTypes.join(', ')}`,
        code: 'INSUFFICIENT_ACCOUNT_TYPE'
      });
    }

    next();
  };
};

// Middleware to check if user has minimum trust score
export const requireMinTrustScore = (minScore: number) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.trustScore < minScore) {
      return res.status(403).json({ 
        error: `Minimum trust score of ${minScore} required. Your score: ${req.user.trustScore}`,
        code: 'INSUFFICIENT_TRUST_SCORE'
      });
    }

    next();
  };
};

// Middleware for moderators
export const requireModerator = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    // Check if user has moderator privileges
    // In a real system, you'd have a separate moderators table or role system
    // For now, we'll use a simple check: VENUE accounts with high trust scores can moderate
    const isModerator = req.user.accountType === 'VENUE' && req.user.trustScore >= 85;
    
    if (!isModerator) {
      res.status(403).json({ 
        error: 'Moderator privileges required',
        code: 'MODERATOR_REQUIRED'
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Moderator check error:', error);
    res.status(500).json({ 
      error: 'Authorization check failed',
      code: 'AUTH_CHECK_ERROR'
    });
  }
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without auth
    }

    try {
      const decoded = await verifyAccessToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          phone: true,
          accountType: true,
          accountStatus: true,
          trustScore: true,
          phoneVerified: true
        }
      });

      if (user && user.accountStatus === 'ACTIVE' && user.phoneVerified) {
        req.user = {
          id: user.id,
          email: user.email || undefined,
          phone: user.phone,
          accountType: user.accountType,
          trustScore: user.trustScore
        };
      }
    } catch (jwtError) {
      // Silent fail for optional auth
      logger.debug('Optional auth failed:', jwtError);
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    next(); // Continue even if there's an error
  }
};