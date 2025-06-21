import crypto from 'crypto';
import { logger } from './logger';

/**
 * Generate a 6-digit verification code
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a secure random string
 */
export const generateRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Calculate trust score based on various factors
 */
export const calculateTrustScore = (components: {
  socialMediaVerification: number;
  communityNetwork: number;
  platformActivity: number;
  contentQuality: number;
  timeInvestment: number;
  commentEngagement: number;
  eventParticipation: number;
  validationAccuracy: number;
}): number => {
  const weights = {
    socialMediaVerification: 0.20,
    communityNetwork: 0.20,
    platformActivity: 0.15,
    contentQuality: 0.15,
    timeInvestment: 0.10,
    commentEngagement: 0.10,
    eventParticipation: 0.05,
    validationAccuracy: 0.05
  };

  const weightedScore = Object.entries(components).reduce((total, [key, value]) => {
    const weight = weights[key as keyof typeof weights];
    return total + (value * weight);
  }, 0);

  // Round to nearest integer and ensure it's within bounds
  return Math.max(0, Math.min(100, Math.round(weightedScore)));
};

/**
 * Get default trust score components for new users
 */
export const getDefaultTrustComponents = () => ({
  socialMediaVerification: 0,
  communityNetwork: 25, // Give new users some base community score
  platformActivity: 10,
  contentQuality: 50, // Neutral starting point
  timeInvestment: 5,
  commentEngagement: 30,
  eventParticipation: 0,
  validationAccuracy: 50 // Neutral starting point
});

/**
 * Calculate daily flag limit based on trust score
 */
export const getDailyFlagLimit = (trustScore: number): number => {
  if (trustScore >= 90) return 5;
  if (trustScore >= 70) return 3;
  if (trustScore >= 50) return 2;
  return 1;
};

/**
 * Determine flag priority based on various factors
 */
export const calculateFlagPriority = (
  flagCategory: string,
  flaggerTrustScore: number,
  flaggedUserTrustScore: number,
  evidenceLength: number
): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' => {
  let priorityScore = 0;

  // Category weight
  const categoryWeights: Record<string, number> = {
    'ACCOUNT_NOT_OWNED': 3,
    'FAKE_ACCOUNT': 3,
    'IMPERSONATION': 3,
    'MISLEADING_PROFESSIONAL': 2,
    'HARASSMENT': 2,
    'INAPPROPRIATE_CONTENT': 1,
    'SPAM': 1,
    'ACCOUNT_NOT_CONNECTED': 1
  };

  priorityScore += categoryWeights[flagCategory] || 1;

  // Flagger trust score weight (higher trust = more credible flag)
  if (flaggerTrustScore >= 90) priorityScore += 2;
  else if (flaggerTrustScore >= 70) priorityScore += 1;
  else if (flaggerTrustScore < 50) priorityScore -= 1;

  // Flagged user trust score weight (higher trust = lower priority as might be false flag)
  if (flaggedUserTrustScore >= 90) priorityScore -= 1;
  else if (flaggedUserTrustScore < 50) priorityScore += 1;

  // Evidence quality weight
  if (evidenceLength > 200) priorityScore += 1;
  else if (evidenceLength < 50) priorityScore -= 1;

  // Return priority based on score
  if (priorityScore >= 5) return 'URGENT';
  if (priorityScore >= 3) return 'HIGH';
  if (priorityScore >= 1) return 'MEDIUM';
  return 'LOW';
};

/**
 * Sanitize username to ensure it meets requirements
 */
export const sanitizeUsername = (username: string): string => {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '') // Remove invalid characters
    .substring(0, 30); // Limit length
};

/**
 * Generate a unique username suggestion
 */
export const generateUsernameFromName = (name: string, existingUsernames: string[] = []): string => {
  const base = sanitizeUsername(name.replace(/\s+/g, '_'));
  let suggestion = base;
  let counter = 1;

  while (existingUsernames.includes(suggestion)) {
    suggestion = `${base}_${counter}`;
    counter++;
  }

  return suggestion;
};

/**
 * Format phone number to international format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add + prefix if not present
  if (!phone.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return phone;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

/**
 * Paginate results
 */
export const paginate = (page: number = 1, limit: number = 20) => {
  const take = Math.min(limit, 100); // Max 100 items per page
  const skip = (page - 1) * take;
  return { take, skip };
};

/**
 * Create a slug from text
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

/**
 * Escape HTML to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (match) => map[match]);
};

/**
 * Log performance of async operations
 */
export const withPerformanceLogging = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logger.info(`${operationName} completed in ${duration}ms`);
    
    if (duration > 1000) {
      logger.warn(`${operationName} took longer than expected: ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logger.error(`${operationName} failed after ${duration}ms:`, error);
    throw error;
  }
};

/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry an async operation with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms:`, error);
      
      await sleep(delay);
    }
  }
  
  throw lastError!;
};