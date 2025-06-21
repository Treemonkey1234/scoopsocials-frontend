import { generateTokens, verifyAccessToken, verifyRefreshToken, blacklistToken, rotateRefreshToken } from '../utils/tokenUtils';
import { redis } from '../server';
import { prisma } from '../server';
import jwt from 'jsonwebtoken';
import env from '../config/environment';

// Mock dependencies
jest.mock('../server', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn()
  },
  prisma: {
    refreshToken: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn()
    }
  }
}));

jest.mock('../config/environment', () => ({
  env: {
    JWT_SECRET: 'test-jwt-secret-32-characters-long',
    REFRESH_TOKEN_SECRET: 'test-refresh-secret-32-characters-long'
  }
}));

describe('Token Utils', () => {
  const userId = 'test-user-id';
  const mockRedis = redis as jest.Mocked<typeof redis>;
  const mockPrisma = prisma as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate valid access and refresh tokens', () => {
      const tokens = generateTokens(userId);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');

      // Verify token structure
      const accessPayload = jwt.decode(tokens.accessToken) as any;
      const refreshPayload = jwt.decode(tokens.refreshToken) as any;

      expect(accessPayload.userId).toBe(userId);
      expect(refreshPayload.userId).toBe(userId);
      expect(accessPayload.iss).toBe('scoopsocials');
      expect(refreshPayload.iss).toBe('scoopsocials');
    });

    it('should generate tokens with correct expiration times', () => {
      const tokens = generateTokens(userId);
      
      const accessPayload = jwt.decode(tokens.accessToken) as any;
      const refreshPayload = jwt.decode(tokens.refreshToken) as any;

      const now = Math.floor(Date.now() / 1000);
      
      // Access token should expire in 24 hours (86400 seconds)
      expect(accessPayload.exp - accessPayload.iat).toBe(86400);
      
      // Refresh token should expire in 7 days (604800 seconds)
      expect(refreshPayload.exp - refreshPayload.iat).toBe(604800);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', async () => {
      const tokens = generateTokens(userId);
      mockRedis.get.mockResolvedValue(null); // Not blacklisted

      const decoded = await verifyAccessToken(tokens.accessToken);

      expect(decoded.userId).toBe(userId);
      expect(mockRedis.get).toHaveBeenCalledWith(`blacklist:${tokens.accessToken}`);
    });

    it('should reject a blacklisted token', async () => {
      const tokens = generateTokens(userId);
      mockRedis.get.mockResolvedValue('blacklisted');

      await expect(verifyAccessToken(tokens.accessToken)).rejects.toThrow('Token has been revoked');
    });

    it('should reject an expired token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId }, 
        env.JWT_SECRET, 
        { expiresIn: '-1h', issuer: 'scoopsocials', audience: 'scoopsocials-client' }
      );
      mockRedis.get.mockResolvedValue(null);

      await expect(verifyAccessToken(expiredToken)).rejects.toThrow('Token has expired');
    });

    it('should reject an invalid token', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(verifyAccessToken('invalid.token.here')).rejects.toThrow('Invalid token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const tokens = generateTokens(userId);

      const decoded = verifyRefreshToken(tokens.refreshToken);

      expect(decoded.userId).toBe(userId);
    });

    it('should reject an expired refresh token', () => {
      const expiredToken = jwt.sign(
        { userId }, 
        env.REFRESH_TOKEN_SECRET, 
        { expiresIn: '-1h', issuer: 'scoopsocials', audience: 'scoopsocials-client' }
      );

      expect(() => verifyRefreshToken(expiredToken)).toThrow('Refresh token has expired');
    });

    it('should reject an invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid.token.here')).toThrow('Invalid refresh token');
    });
  });

  describe('blacklistToken', () => {
    it('should blacklist a valid token with correct TTL', async () => {
      const tokens = generateTokens(userId);
      const decoded = jwt.decode(tokens.accessToken) as any;
      const now = Math.floor(Date.now() / 1000);
      const expectedTTL = decoded.exp - now;

      await blacklistToken(tokens.accessToken);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `blacklist:${tokens.accessToken}`,
        expectedTTL,
        'blacklisted'
      );
    });

    it('should handle invalid tokens gracefully', async () => {
      await blacklistToken('invalid.token');

      // Should not call Redis if token is invalid
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('should not blacklist already expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId }, 
        env.JWT_SECRET, 
        { expiresIn: '-1h' }
      );

      await blacklistToken(expiredToken);

      expect(mockRedis.setex).not.toHaveBeenCalled();
    });
  });

  describe('rotateRefreshToken', () => {
    const oldRefreshToken = 'old.refresh.token';

    beforeEach(() => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.refreshToken.create.mockResolvedValue({
        id: 'new-token-id',
        token: 'new.refresh.token',
        userId,
        expiresAt: new Date()
      });
    });

    it('should delete old token and create new tokens', async () => {
      const newTokens = await rotateRefreshToken(oldRefreshToken, userId);

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: oldRefreshToken }
      });

      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
        data: {
          token: newTokens.refreshToken,
          userId,
          expiresAt: expect.any(Date)
        }
      });

      expect(newTokens).toHaveProperty('accessToken');
      expect(newTokens).toHaveProperty('refreshToken');
    });

    it('should handle database errors', async () => {
      mockPrisma.refreshToken.deleteMany.mockRejectedValue(new Error('Database error'));

      await expect(rotateRefreshToken(oldRefreshToken, userId)).rejects.toThrow('Failed to rotate refresh token');
    });
  });
});