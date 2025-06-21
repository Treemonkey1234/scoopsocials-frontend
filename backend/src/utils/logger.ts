import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import env from '../config/environment';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      )
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d'
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  ]
});

// Create a stream object for Morgan
const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

export const logSecurityEvent = (event: string, metadata?: Record<string, any>) => {
  logger.warn(`Security Event: ${event}`, { ...metadata, type: 'security' });
};

export const logAuthEvent = (event: string, metadata?: Record<string, any>) => {
  logger.info(`Auth Event: ${event}`, { ...metadata, type: 'auth' });
};

export { logger, httpLogStream };