import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
import env from '../config/environment';
import { logger } from './logger';
import { AppError } from './AppError';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a new access token and refresh token pair
 * @param userId - The user ID to include in the token
 * @returns Object containing accessToken and refreshToken
 */
export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRATION
  });

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRATION
  });

  return { accessToken, refreshToken };
};

/**
 * Verify and decode an access token
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid, expired, or blacklisted
 */
export const verifyAccessToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded as { userId: string };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
    }
    throw error;
  }
};

/**
 * Verify and decode a refresh token
 * @param token - The refresh token to verify
 * @returns Decoded token payload
 */
export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256']
    });
    return decoded as { userId: string };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      }
    }
    throw error;
  }
};

/**
 * Blacklist an access token (for logout)
 * @param token - The access token to blacklist
 */
export async function blacklistToken(token: string): Promise<void> {
  try {
    // Decode token to get expiration time
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded || !decoded.exp) {
      return; // Invalid token, nothing to blacklist
    }
    
    // Calculate TTL (time until token expires)
    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - now;
    
    if (ttl > 0) {
      // Store in Redis with TTL matching token expiration
      await redis.setex(`blacklist:${token}`, ttl, 'blacklisted');
      logger.debug(`Token blacklisted for ${ttl} seconds`);
    }
  } catch (error) {
    logger.error('Error blacklisting token:', error);
    // Don't throw - blacklisting failure shouldn't break logout
  }
}

/**
 * Rotate refresh token - delete old one and create new one
 * @param oldRefreshToken - The old refresh token to invalidate
 * @param userId - The user ID for the new token
 * @returns New token pair
 */
export async function rotateRefreshToken(oldRefreshToken: string, userId: string): Promise<TokenPair> {
  try {
    // Delete old refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: oldRefreshToken }
    });
    
    // Generate new token pair
    const newTokens = generateTokens(userId);
    
    // Store new refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: newTokens.refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
    
    logger.info(`Refresh token rotated for user ${userId}`);
    return newTokens;
  } catch (error) {
    logger.error('Error rotating refresh token:', error);
    throw new Error('Failed to rotate refresh token');
  }
}

/**
 * Revoke all refresh tokens for a user (useful for logout from all devices)
 * @param userId - The user ID to revoke tokens for
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  try {
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });
    
    logger.info(`All refresh tokens revoked for user ${userId}`);
  } catch (error) {
    logger.error('Error revoking user tokens:', error);
    throw new Error('Failed to revoke user tokens');
  }
}

/**
 * Clean up expired refresh tokens from database
 * This should be called periodically via a cron job
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    if (result.count > 0) {
      logger.info(`Cleaned up ${result.count} expired refresh tokens`);
    }
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
  }
}