import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redis } from './config/redis';
import { logger, httpLogStream } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { sanitizeRequest } from './middleware/sanitizeRequest';
import env from './config/environment';
import authRoutes from './routes/auth';
import authSimpleRoutes from './routes/auth-simple';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';

const app = express();
const httpServer = createServer(app);

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Get allowed origins from environment variables
    const allowedOrigins = [
      env.CORS_ORIGIN,           // https://scoopsocials-frontend.vercel.app
      env.FRONTEND_URL,          // https://scoopsocials-frontend.vercel.app
      'https://scoopsocials-frontend-cbhi.vercel.app', // Current deployment URL
      'https://scoopsocials-frontend.vercel.app',      // Main deployment URL
      'http://localhost:3000',   // Local development
      'http://localhost:3001',   // Local backend
      'http://localhost:8080',   // Local test server
      'https://localhost:3000',  // HTTPS local
      'https://localhost:3001',  // HTTPS local backend
    ].filter(Boolean); // Remove any undefined values

    logger.info(`🔍 CORS Check - Origin: ${origin}`);
    logger.info(`🔍 CORS Check - Allowed Origins: ${allowedOrigins.join(', ')}`);

    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin || origin === 'null') {
      logger.info('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      logger.info('✅ CORS: Origin allowed');
      return callback(null, true);
    }

    // For file:// protocol (local HTML files)
    if (origin.startsWith('file://')) {
      logger.info('✅ CORS: Allowing file:// origin');
      return callback(null, true);
    }

    logger.warn(`❌ CORS: Origin not allowed: ${origin}`);
    callback(new Error(`CORS Error: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false
};

// Initialize Socket.IO with enhanced CORS
const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [env.CORS_ORIGIN, env.FRONTEND_URL, 'https://scoopsocials-frontend-cbhi.vercel.app', 'https://scoopsocials-frontend.vercel.app', 'http://localhost:3000'].filter(Boolean);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Socket.IO CORS error'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());

// Apply CORS configuration
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Add manual CORS headers as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    env.CORS_ORIGIN,
    env.FRONTEND_URL,
    'https://scoopsocials-frontend-cbhi.vercel.app',
    'https://scoopsocials-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ].filter(Boolean);

  if (!origin || allowedOrigins.includes(origin) || (origin && origin.startsWith('file://'))) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    logger.info('🔄 CORS: Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: httpLogStream }));
app.use(sanitizeRequest);
app.use(rateLimiter);

// Add health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    cors_origin: env.CORS_ORIGIN,
    frontend_url: env.FRONTEND_URL,
    environment: env.NODE_ENV
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth-simple', authSimpleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Error handling
app.use(errorHandler);

// Initialize Redis and Socket.IO
async function initializeServer() {
  try {
    // Connect to Redis
    await redis.connect();
    logger.info('Connected to Redis');

    // Set up Redis adapter for Socket.IO
    const pubClient = await redis.duplicate();
    const subClient = await redis.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.IO Redis adapter initialized');

    // Start server
    const port = env.PORT || 3000;
    httpServer.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
      logger.info(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
      logger.info(`🌐 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await redis.disconnect();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await redis.disconnect();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start the server
initializeServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export { io };
export default app;