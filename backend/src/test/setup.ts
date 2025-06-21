import { PrismaClient } from '@prisma/client';
import { redis } from '../config/redis';
import env from '../config/environment';

// Test database client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL
    }
  }
});

// Global setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  await redis.connect();

  // Clear database and Redis
  await Promise.all([
    prisma.user.deleteMany(),
    prisma.$executeRaw`TRUNCATE TABLE "Profile" CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "Verification" CASCADE`,
    redis.getClient().flushAll()
  ]);
});

// Global teardown
afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
  
  // Disconnect from Redis
  await redis.disconnect();
});

// Before each test
beforeEach(async () => {
  // Clear database and Redis
  await Promise.all([
    prisma.user.deleteMany(),
    prisma.$executeRaw`TRUNCATE TABLE "Profile" CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "Verification" CASCADE`,
    redis.getClient().flushAll()
  ]);
});

// After each test
afterEach(async () => {
  // Clear database and Redis
  await Promise.all([
    prisma.user.deleteMany(),
    prisma.$executeRaw`TRUNCATE TABLE "Profile" CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "Verification" CASCADE`,
    redis.getClient().flushAll()
  ]);
}); 