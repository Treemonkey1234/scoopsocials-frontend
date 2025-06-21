import { z } from 'zod';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string(),
  TEST_DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string(),
  TEST_REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRATION: z.string().transform(Number).default('900'),
  JWT_REFRESH_EXPIRATION: z.string().transform(Number).default('604800'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
  TRUST_PROXY: z.string().transform(Number).default('1'),
  API_VERSION: z.string().default('v1'),
  API_PREFIX: z.string().default('/api'),
  FRONTEND_URL: z.string().optional(),
  BACKEND_URL: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SWAGGER_TITLE: z.string().default('ScoopSocials API'),
  SWAGGER_VERSION: z.string().default('1.0.0'),
  SWAGGER_DESCRIPTION: z.string().default('API documentation for ScoopSocials'),
  SWAGGER_PATH: z.string().default('/api-docs'),
  SWAGGER_HOST: z.string().optional(),
  SWAGGER_SCHEMES: z.array(z.enum(['http', 'https'])).default(['http']),
  SWAGGER_CONSUMES: z.array(z.string()).default(['application/json']),
  SWAGGER_PRODUCES: z.array(z.string()).default(['application/json']),
  SWAGGER_DEFINITIONS: z.record(z.any()).optional(),
  SWAGGER_SECURITY_DEFINITIONS: z.record(z.any()).optional(),
  SWAGGER_SECURITY: z.array(z.record(z.array(z.string()))).optional(),
  SWAGGER_TAGS: z.array(z.object({
    name: z.string(),
    description: z.string().optional()
  })).optional(),
  SWAGGER_EXTERNAL_DOCS: z.object({
    description: z.string(),
    url: z.string()
  }).optional(),
  SWAGGER_BASE_PATH: z.string().optional(),
  SWAGGER_INFO: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
    contact: z.object({
      name: z.string(),
      email: z.string()
    })
  }).optional()
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  throw new Error(`Invalid environment configuration: ${result.error.message}`);
}

const env = result.data;

export default env;