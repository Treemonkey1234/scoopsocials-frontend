import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import eventsRouter from './routes/events';

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Get allowed origins - using environment variables if available
    const allowedOrigins = [
      'https://scoopsocials-frontend.vercel.app', // Production frontend
      'https://treemonkey1234.github.io',         // Legacy GitHub Pages
      'http://localhost:3000',                    // Local development
      'http://localhost:19006',                   // Expo development
      'http://localhost:3001',                    // Local backend
      'https://localhost:3000',                   // HTTPS local
    ];

    logger.info(`🔍 CORS Check - Origin: ${origin}`);
    logger.info(`🔍 CORS Check - Allowed Origins: ${allowedOrigins.join(', ')}`);

    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
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
  exposedHeaders: ['Set-Cookie', 'Content-Length'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Apply CORS configuration
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Add manual CORS headers as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://scoopsocials-frontend.vercel.app',
    'https://treemonkey1234.github.io',
    'http://localhost:3000',
    'http://localhost:19006',
    'http://localhost:3001'
  ];

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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Health check endpoint with detailed info
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'none',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);

// Error handling
app.use(errorHandler);

export default app; 