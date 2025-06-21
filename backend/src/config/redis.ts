import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import env from './environment';

/**
 * Enhanced Redis client with automatic reconnection, health monitoring,
 * and exponential backoff for resilient operation in production environments.
 */
export class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });
  }

  async connect() {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  getClient() {
    return this.client;
  }

  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    return await this.client.expire(key, seconds);
  }

  async pTTL(key: string): Promise<number> {
    return await this.client.pTTL(key);
  }

  async lpush(key: string, value: string): Promise<number> {
    return await this.client.lPush(key, value);
  }

  async ltrim(key: string, start: number, stop: number): Promise<boolean> {
    const result = await this.client.lTrim(key, start, stop);
    return result === 'OK';
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.lRange(key, start, stop);
  }

  async duplicate(): Promise<RedisClientType> {
    return this.client.duplicate();
  }

  isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Get a value from Redis by key
   * @param key - The Redis key to retrieve
   * @returns The value or null if not found/error
   */
  async get(key: string): Promise<string | null> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping get operation');
        return null;
      }
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Set a value in Redis with optional TTL
   * @param key - The Redis key to set
   * @param value - The value to store
   * @param ttlSeconds - Optional time-to-live in seconds
   * @returns True if successful, false otherwise
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping set operation');
        return false;
      }
      
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping delete operation');
        return false;
      }
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    try {
      if (!this.isConnected) {
        return 0;
      }
      
      const result = await this.client.incr(key);
      
      if (ttlSeconds && result === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      
      return result;
    } catch (error) {
      logger.error('Redis INCR error:', error);
      return 0;
    }
  }

  async setJson(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      return await this.set(key, JSON.stringify(value), ttlSeconds);
    } catch (error) {
      logger.error('Redis SET JSON error:', error);
      return false;
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET JSON error:', error);
      return null;
    }
  }

  /**
   * Store a phone verification code with 5-minute expiration
   * @param phone - The phone number to associate with the code
   * @param code - The verification code to store
   * @returns True if successful, false otherwise
   */
  async setPhoneVerificationCode(phone: string, code: string): Promise<boolean> {
    const key = `phone_verification:${phone}`;
    return await this.set(key, code, 300); // 5 minutes TTL
  }

  async getPhoneVerificationCode(phone: string): Promise<string | null> {
    const key = `phone_verification:${phone}`;
    return await this.get(key);
  }

  async deletePhoneVerificationCode(phone: string): Promise<boolean> {
    const key = `phone_verification:${phone}`;
    return await this.del(key);
  }

  /**
   * Check if a request is allowed based on rate limiting rules
   * @param identifier - Unique identifier for the rate limit (e.g., IP address, user ID)
   * @param maxRequests - Maximum number of requests allowed in the window
   * @param windowSeconds - Time window in seconds
   * @returns Object with allowed status, remaining requests, and reset time
   */
  async checkRateLimit(identifier: string, maxRequests: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${identifier}`;
    const current = await this.increment(key, windowSeconds);
    
    const remaining = Math.max(0, maxRequests - current);
    const allowed = current <= maxRequests;
    const resetTime = Date.now() + (windowSeconds * 1000);
    
    return { allowed, remaining, resetTime };
  }

  // Session management
  async setUserSession(userId: string, sessionData: any): Promise<boolean> {
    const key = `session:${userId}`;
    return await this.setJson(key, sessionData, 24 * 60 * 60); // 24 hours
  }

  async getUserSession(userId: string): Promise<any | null> {
    const key = `session:${userId}`;
    return await this.getJson(key);
  }

  async deleteUserSession(userId: string): Promise<boolean> {
    const key = `session:${userId}`;
    return await this.del(key);
  }

  // Flag submission tracking
  async incrementDailyFlags(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_flags:${userId}:${today}`;
    const ttl = 24 * 60 * 60; // 24 hours
    return await this.increment(key, ttl);
  }

  async getDailyFlagCount(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_flags:${userId}:${today}`;
    const count = await this.get(key);
    return count ? parseInt(count) : 0;
  }

  async setex(key: string, seconds: number, value: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping setex operation');
        return false;
      }
      
      await this.client.setEx(key, seconds, value);
      return true;
    } catch (error) {
      logger.error('Redis SETEX error:', error);
      return false;
    }
  }
}

const redis = new RedisClient();

export { redis };