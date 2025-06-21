import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import env from './environment';

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log Prisma events
prisma.$on('query', (e: any) => {
  logger.debug('Prisma Query:', {
    query: e.query,
    params: e.params,
    duration: e.duration,
  });
});

prisma.$on('error', (e: any) => {
  logger.error('Prisma Error:', {
    message: e.message,
    target: e.target,
  });
});

prisma.$on('info', (e: any) => {
  logger.info('Prisma Info:', {
    message: e.message,
    target: e.target,
  });
});

prisma.$on('warn', (e: any) => {
  logger.warn('Prisma Warning:', {
    message: e.message,
    target: e.target,
  });
});

// Connect to database with graceful error handling
let isConnected = false;

prisma.$connect()
  .then(() => {
    logger.info('✅ Connected to database');
    isConnected = true;
  })
  .catch((error: Error) => {
    logger.warn('⚠️ Failed to connect to database:', error.message);
    logger.info('🔄 Server will start with limited functionality (Redis only)');
    isConnected = false;
  });

// Handle process termination
process.on('SIGINT', async () => {
  if (isConnected) {
    await prisma.$disconnect();
    logger.info('Disconnected from database');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (isConnected) {
    await prisma.$disconnect();
    logger.info('Disconnected from database');
  }
  process.exit(0);
});

export { prisma, isConnected }; 