import { Request } from 'express';
import { redis } from '../config/redis';
import { prisma } from '../config/prisma';
import { logger, logAuthEvent } from '../utils/logger';
import { logSecurityEvent } from '../utils/logger';
import { blacklistToken, rotateRefreshToken } from '../utils/tokenUtils';
import { AppError } from '../utils/AppError';

interface SecurityContext {
  userId: string;
  ip: string;
  userAgent: string;
  endpoint: string;
  method: string;
  timestamp: Date;
}

interface SuspiciousActivityPattern {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  check: (context: SecurityContext, history: SecurityEvent[]) => boolean;
  action: 'log' | 'rotate_tokens' | 'block_user' | 'require_verification';
}

interface SecurityEvent {
  userId: string;
  type: string;
  severity: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

class SecurityService {
  private readonly SECURITY_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  private readonly MAX_EVENTS_PER_USER = 100;
  
  // Suspicious activity patterns
  private patterns: SuspiciousActivityPattern[] = [
    {
      name: 'rapid_token_refresh',
      severity: 'medium',
      check: (context, history) => {
        const recentRefreshes = history.filter(
          event => event.type === 'token_refresh' && 
          Date.now() - event.timestamp.getTime() < 5 * 60 * 1000 // 5 minutes
        );
        return recentRefreshes.length > 10;
      },
      action: 'rotate_tokens'
    },
    {
      name: 'multiple_ip_addresses',
      severity: 'high',
      check: (context, history) => {
        const recentIPs = new Set(
          history.filter(
            event => Date.now() - event.timestamp.getTime() < 30 * 60 * 1000 // 30 minutes
          ).map(event => event.ip)
        );
        return recentIPs.size > 5;
      },
      action: 'rotate_tokens'
    },
    {
      name: 'suspicious_user_agent',
      severity: 'medium',
      check: (context) => {
        const suspiciousPatterns = [
          /bot|crawler|spider/i,
          /curl|wget|python|postman/i,
          /^$/,
          /.{0,10}$/ // Very short user agent
        ];
        return suspiciousPatterns.some(pattern => pattern.test(context.userAgent));
      },
      action: 'log'
    },
    {
      name: 'frequent_failed_auth',
      severity: 'high',
      check: (context, history) => {
        const failedAuths = history.filter(
          event => event.type === 'auth_failed' && 
          Date.now() - event.timestamp.getTime() < 15 * 60 * 1000 // 15 minutes
        );
        return failedAuths.length > 5;
      },
      action: 'require_verification'
    },
    {
      name: 'impossible_travel',
      severity: 'critical',
      check: (context, history) => {
        // Simple geolocation check - in production, use proper IP geolocation
        const recentEvents = history.filter(
          event => Date.now() - event.timestamp.getTime() < 60 * 60 * 1000 // 1 hour
        );
        
        const uniqueIPs = new Set(recentEvents.map(event => event.ip));
        // If more than 3 different IP addresses in 1 hour, flag as suspicious
        return uniqueIPs.size > 3;
      },
      action: 'rotate_tokens'
    }
  ];
  
  /**
   * Analyze user activity for suspicious patterns
   */
  async analyzeActivity(userId: string, req: Request, eventType: string): Promise<void> {
    const context: SecurityContext = {
      userId,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date()
    };
    
    // Record the security event
    await this.recordSecurityEvent(userId, eventType, 'info', context);
    
    // Get recent security history for this user
    const history = await this.getSecurityHistory(userId);
    
    // Check each pattern
    for (const pattern of this.patterns) {
      if (pattern.check(context, history)) {
        await this.handleSuspiciousActivity(userId, pattern, context);
      }
    }
  }
  
  /**
   * Record a security event
   */
  private async recordSecurityEvent(
    userId: string, 
    eventType: string, 
    severity: string, 
    context: SecurityContext
  ): Promise<void> {
    const event: SecurityEvent = {
      userId,
      type: eventType,
      severity,
      ip: context.ip,
      userAgent: context.userAgent,
      timestamp: context.timestamp,
      metadata: {
        endpoint: context.endpoint,
        method: context.method
      }
    };
    
    const eventKey = `security_events:${userId}`;
    
    try {
      // Store event in Redis with expiration
      await redis.lpush(eventKey, JSON.stringify(event));
      await redis.ltrim(eventKey, 0, this.MAX_EVENTS_PER_USER - 1);
      await redis.expire(eventKey, this.SECURITY_WINDOW_MS / 1000);
    } catch (error) {
      // If Redis fails, still log the event
      logSecurityEvent('redis_security_event_failed', { 
        userId, 
        eventType, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  /**
   * Get security history for a user
   */
  private async getSecurityHistory(userId: string): Promise<SecurityEvent[]> {
    const eventKey = `security_events:${userId}`;
    
    try {
      const events = await redis.lrange(eventKey, 0, -1);
      return events.map(eventStr => JSON.parse(eventStr));
    } catch (error) {
      logSecurityEvent('redis_security_history_failed', { 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return [];
    }
  }
  
  /**
   * Handle detected suspicious activity
   */
  private async handleSuspiciousActivity(
    userId: string, 
    pattern: SuspiciousActivityPattern, 
    context: SecurityContext
  ): Promise<void> {
    logSecurityEvent('suspicious_activity_detected', {
      userId,
      pattern: pattern.name,
      severity: pattern.severity,
      ip: context.ip,
      userAgent: context.userAgent,
      endpoint: context.endpoint,
      action: pattern.action
    });
    
    // Record the suspicious activity
    await this.recordSecurityEvent(userId, 'suspicious_activity', pattern.severity, context);
    
    // Execute the appropriate action
    switch (pattern.action) {
      case 'rotate_tokens':
        await this.rotateUserTokens(userId, `Suspicious activity: ${pattern.name}`);
        break;
        
      case 'block_user':
        await this.blockUser(userId, `Suspicious activity: ${pattern.name}`);
        break;
        
      case 'require_verification':
        await this.requireVerification(userId, `Suspicious activity: ${pattern.name}`);
        break;
        
      case 'log':
        // Already logged above
        break;
    }
  }
  
  /**
   * Rotate all tokens for a user
   */
  private async rotateUserTokens(userId: string, reason: string): Promise<void> {
    try {
      // Get all refresh tokens for the user
      const refreshTokens = await prisma.refreshToken.findMany({
        where: { userId }
      });
      
      // Blacklist all current access tokens (this would need to be enhanced 
      // with a way to get current access tokens)
      logAuthEvent('forced_token_rotation', { userId, reason });
      
      // Delete all refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId }
      });
      
      // Mark user as requiring re-authentication
      await redis.setex(`require_reauth:${userId}`, 3600, 'true'); // 1 hour
      
      logSecurityEvent('tokens_rotated', {
        userId,
        reason,
        refreshTokensRevoked: refreshTokens.length
      });
      
    } catch (error) {
      logSecurityEvent('token_rotation_failed', {
        userId,
        reason,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new AppError(500, 'TOKEN_ROTATION_FAILED', [{ message: 'Failed to rotate tokens' }]);
    }
  }
  
  /**
   * Block a user account
   */
  private async blockUser(userId: string, reason: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          accountStatus: 'SUSPENDED',
          // suspendedAt: new Date(),
          // suspensionReason: reason
        }
      });
      
      // Revoke all tokens
      await this.rotateUserTokens(userId, reason);
      
      logSecurityEvent('user_blocked', { userId, reason });
      
    } catch (error) {
      logSecurityEvent('user_block_failed', {
        userId,
        reason,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Require additional verification for a user
   */
  private async requireVerification(userId: string, reason: string): Promise<void> {
    try {
      // Set verification requirement flag
      await redis.setex(`require_verification:${userId}`, 3600, reason); // 1 hour
      
      logSecurityEvent('verification_required', { userId, reason });
      
    } catch (error) {
      logSecurityEvent('verification_requirement_failed', {
        userId,
        reason,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Check if user requires additional verification
   */
  async requiresVerification(userId: string): Promise<{ required: boolean; reason?: string }> {
    try {
      const reason = await redis.get(`require_verification:${userId}`);
      return {
        required: Boolean(reason),
        reason: reason || undefined
      };
    } catch (error) {
      return { required: false };
    }
  }
  
  /**
   * Check if user requires re-authentication
   */
  async requiresReauth(userId: string): Promise<boolean> {
    try {
      const required = await redis.get(`require_reauth:${userId}`);
      return Boolean(required);
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Clear verification requirements
   */
  async clearVerificationRequirement(userId: string): Promise<void> {
    try {
      await redis.del(`require_verification:${userId}`);
      await redis.del(`require_reauth:${userId}`);
    } catch (error) {
      logSecurityEvent('clear_verification_failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const securityService = new SecurityService();

export async function forceTokenRotation(userId: string, reason: string) {
  try {
    logger.info('Forcing token rotation', { userId, reason });

    // Invalidate all existing tokens in Redis
    const pattern = `token:${userId}:*`;
    const client = await redis.duplicate();
    await client.connect();

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }

    await client.quit();

    // Update user's security settings
    await prisma.user.update({
      where: { id: userId },
      data: {
        updatedAt: new Date()
      }
    });

    logAuthEvent('forced_token_rotation', { userId, reason });
    logger.info('Token rotation completed', { userId });
  } catch (error) {
    logger.error('Error during token rotation', { error, userId });
    throw new AppError(500, 'TOKEN_ROTATION_FAILED', [{ message: 'Failed to rotate tokens' }]);
  }
}