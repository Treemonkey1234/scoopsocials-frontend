import request from 'supertest';
import app from '../../server';
import { prisma, redis } from '../../test/setup';
import { generateTokens } from '../../utils/tokenUtils';

describe('Auth Routes', () => {
  const testUser = {
    phone: '+1234567890',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    accountType: 'FREE' as const,
    bio: 'Test bio'
  };

  describe('POST /api/auth/test-signup', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/auth/test-signup')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        name: testUser.name,
        username: testUser.username,
        phone: testUser.phone,
        email: testUser.email,
        accountType: testUser.accountType
      });
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should not create user with duplicate phone', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/test-signup')
        .send(testUser);

      // Try to create second user with same phone
      const response = await request(app)
        .post('/api/auth/test-signup')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Phone number already registered');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens', async () => {
      // Create user and get tokens
      const signupResponse = await request(app)
        .post('/api/auth/test-signup')
        .send(testUser);

      const { refreshToken } = signupResponse.body;

      // Refresh tokens
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(signupResponse.body.accessToken);
      expect(response.body.refreshToken).not.toBe(refreshToken);
    });

    it('should not refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid or expired refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user', async () => {
      // Create user and get tokens
      const signupResponse = await request(app)
        .post('/api/auth/test-signup')
        .send(testUser);

      const { accessToken } = signupResponse.body;

      // Logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');

      // Verify token is blacklisted
      const verifyResponse = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(verifyResponse.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      // Create user and get tokens
      const signupResponse = await request(app)
        .post('/api/auth/test-signup')
        .send(testUser);

      const { accessToken } = signupResponse.body;

      // Get profile
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        name: testUser.name,
        username: testUser.username,
        phone: testUser.phone,
        email: testUser.email,
        accountType: testUser.accountType
      });
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
}); 