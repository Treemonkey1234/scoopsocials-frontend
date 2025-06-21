import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../utils/tokenUtils';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import env from '../config/environment';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const router = Router();

// Validation schema for test signup
const testSignupSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Use international format (+1234567890)'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email format').optional(),
  accountType: z.enum(['FREE', 'PROFESSIONAL', 'VENUE']).default('FREE'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional()
});

// GET /api/auth/health
router.get('/health', (req, res) => {
  res.json({ status: 'Auth service OK', timestamp: new Date().toISOString() });
});

// POST /api/auth/test-signup
router.post('/test-signup', async (req, res) => {
  try {
    const validatedData = testSignupSchema.parse(req.body);
    const { phone, name, username, email, accountType, bio } = validatedData;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { username },
          ...(email ? [{ email }] : [])
        ]
      }
    });
    
    if (existingUser) {
      if (existingUser.phone === phone) {
        return res.status(409).json({ error: 'Phone number already registered' });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      if (email && existingUser.email === email) {
        return res.status(409).json({ error: 'Email already registered' });
      }
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        phone,
        name,
        username,
        email: email || undefined,
        accountType: (accountType as any) || 'FREE',
        bio: bio || undefined,
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        onboardingComplete: true
      }
    });

    // Generate tokens
    const tokens = generateTokens(newUser.id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        phone: newUser.phone,
        email: newUser.email,
        accountType: newUser.accountType,
        trustScore: newUser.trustScore,
        phoneVerified: newUser.phoneVerified,
        bio: newUser.bio
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        return res.status(409).json({
          error: 'Conflict',
          message: `A user with this ${target?.[0] || 'data'} already exists`,
          details: env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
    throw error;
  }
});

export default router;