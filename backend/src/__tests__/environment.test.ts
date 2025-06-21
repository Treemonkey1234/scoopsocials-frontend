import { validateEnvironment } from '../config/environment';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Development Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should validate successfully with minimum required variables', () => {
      process.env.JWT_SECRET = 'dev-jwt-secret';
      process.env.REFRESH_TOKEN_SECRET = 'dev-refresh-secret';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';

      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should use fallback values in development', () => {
      process.env.JWT_SECRET = 'dev-jwt-secret';
      process.env.REFRESH_TOKEN_SECRET = 'dev-refresh-secret';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';

      const config = validateEnvironment();

      expect(config.PORT).toBe(3001);
      expect(config.CORS_ORIGIN).toBe('http://localhost:3000');
      expect(config.REDIS_URL).toBe('redis://localhost:6379');
    });

    it('should warn about missing variables but not throw', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Missing required variables
      expect(() => validateEnvironment()).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Production Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should validate successfully with all required production variables', () => {
      process.env.JWT_SECRET = 'production-jwt-secret-32-chars-long';
      process.env.REFRESH_TOKEN_SECRET = 'production-refresh-secret-32-chars-long';
      process.env.DATABASE_URL = 'postgresql://prod:5432/scoopsocials';
      process.env.REDIS_URL = 'redis://prod:6379';
      process.env.CORS_ORIGIN = 'https://app.scoopsocials.com';
      process.env.FRONTEND_URL = 'https://app.scoopsocials.com';
      process.env.BACKEND_URL = 'https://api.scoopsocials.com';

      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should throw when required production variables are missing', () => {
      expect(() => validateEnvironment()).toThrow(/Missing required environment variables/);
    });

    it('should reject development JWT secrets in production', () => {
      process.env.JWT_SECRET = 'dev-secret';
      process.env.REFRESH_TOKEN_SECRET = 'production-refresh-secret-32-chars-long';
      process.env.DATABASE_URL = 'postgresql://prod:5432/scoopsocials';
      process.env.REDIS_URL = 'redis://prod:6379';
      process.env.CORS_ORIGIN = 'https://app.scoopsocials.com';
      process.env.FRONTEND_URL = 'https://app.scoopsocials.com';
      process.env.BACKEND_URL = 'https://api.scoopsocials.com';

      expect(() => validateEnvironment()).toThrow(/JWT_SECRET cannot use development/);
    });

    it('should reject fallback JWT secrets in production', () => {
      process.env.JWT_SECRET = 'fallback-secret';
      process.env.REFRESH_TOKEN_SECRET = 'production-refresh-secret-32-chars-long';
      process.env.DATABASE_URL = 'postgresql://prod:5432/scoopsocials';
      process.env.REDIS_URL = 'redis://prod:6379';
      process.env.CORS_ORIGIN = 'https://app.scoopsocials.com';
      process.env.FRONTEND_URL = 'https://app.scoopsocials.com';
      process.env.BACKEND_URL = 'https://api.scoopsocials.com';

      expect(() => validateEnvironment()).toThrow(/JWT_SECRET cannot use development/);
    });

    it('should require JWT secrets to be at least 32 characters in production', () => {
      process.env.JWT_SECRET = 'short';
      process.env.REFRESH_TOKEN_SECRET = 'production-refresh-secret-32-chars-long';
      process.env.DATABASE_URL = 'postgresql://prod:5432/scoopsocials';
      process.env.REDIS_URL = 'redis://prod:6379';
      process.env.CORS_ORIGIN = 'https://app.scoopsocials.com';
      process.env.FRONTEND_URL = 'https://app.scoopsocials.com';
      process.env.BACKEND_URL = 'https://api.scoopsocials.com';

      expect(() => validateEnvironment()).toThrow(/JWT_SECRET must be at least 32 characters/);
    });

    it('should require refresh token secrets to be at least 32 characters in production', () => {
      process.env.JWT_SECRET = 'production-jwt-secret-32-chars-long';
      process.env.REFRESH_TOKEN_SECRET = 'short';
      process.env.DATABASE_URL = 'postgresql://prod:5432/scoopsocials';
      process.env.REDIS_URL = 'redis://prod:6379';
      process.env.CORS_ORIGIN = 'https://app.scoopsocials.com';
      process.env.FRONTEND_URL = 'https://app.scoopsocials.com';
      process.env.BACKEND_URL = 'https://api.scoopsocials.com';

      expect(() => validateEnvironment()).toThrow(/REFRESH_TOKEN_SECRET must be at least 32 characters/);
    });
  });

  describe('Configuration Output', () => {
    it('should return proper configuration object', () => {
      process.env.NODE_ENV = 'development';
      process.env.JWT_SECRET = 'dev-jwt-secret';
      process.env.REFRESH_TOKEN_SECRET = 'dev-refresh-secret';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.PORT = '4000';
      process.env.RATE_LIMIT_WINDOW_MS = '600000';
      process.env.RATE_LIMIT_MAX_REQUESTS = '50';

      const config = validateEnvironment();

      expect(config).toEqual(expect.objectContaining({
        NODE_ENV: 'development',
        PORT: 4000,
        JWT_SECRET: 'dev-jwt-secret',
        REFRESH_TOKEN_SECRET: 'dev-refresh-secret',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        RATE_LIMIT_WINDOW_MS: 600000,
        RATE_LIMIT_MAX_REQUESTS: 50
      }));
    });

    it('should handle optional environment variables', () => {
      process.env.NODE_ENV = 'development';
      process.env.JWT_SECRET = 'dev-jwt-secret';
      process.env.REFRESH_TOKEN_SECRET = 'dev-refresh-secret';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.TWILIO_ACCOUNT_SID = 'test-twilio-sid';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';

      const config = validateEnvironment();

      expect(config.TWILIO_ACCOUNT_SID).toBe('test-twilio-sid');
      expect(config.STRIPE_SECRET_KEY).toBe('sk_test_123');
    });
  });
});