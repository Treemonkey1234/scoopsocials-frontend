import twilio from 'twilio';
import { logger } from '../utils/logger';
import { ServiceUnavailableError } from '../middleware/errorHandler';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
} else {
  logger.warn('Twilio credentials not configured. SMS service will be disabled.');
}

export const sendSMS = async (to: string, message: string): Promise<void> => {
  try {
    if (!twilioClient || !twilioPhoneNumber) {
      // In development, log the SMS instead of sending
      if (process.env.NODE_ENV === 'development') {
        logger.info(`[SMS] To: ${to}, Message: ${message}`);
        return;
      }
      throw new ServiceUnavailableError('SMS service not configured');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    logger.info(`SMS sent successfully to ${to}, SID: ${result.sid}`);
  } catch (error) {
    logger.error('Failed to send SMS:', error);
    
    if (process.env.NODE_ENV === 'development') {
      // In development, don't fail on SMS errors
      logger.info(`[SMS FALLBACK] To: ${to}, Message: ${message}`);
      return;
    }
    
    throw new ServiceUnavailableError('Failed to send verification code');
  }
};

export const sendVerificationCode = async (phone: string, code: string): Promise<void> => {
  const message = `Your ScoopSocials verification code is: ${code}. This code expires in 5 minutes.`;
  await sendSMS(phone, message);
};

export const sendWelcomeSMS = async (phone: string, name: string): Promise<void> => {
  const message = `Welcome to ScoopSocials, ${name}! Your account has been created successfully. Start building your trust network today.`;
  await sendSMS(phone, message);
};

export const sendFriendRequestNotification = async (phone: string, requesterName: string): Promise<void> => {
  const message = `${requesterName} sent you a friend request on ScoopSocials. Open the app to respond.`;
  await sendSMS(phone, message);
};

export const sendEventInvitationSMS = async (phone: string, eventTitle: string, organizerName: string): Promise<void> => {
  const message = `${organizerName} invited you to "${eventTitle}" on ScoopSocials. Check the app for details.`;
  await sendSMS(phone, message);
};