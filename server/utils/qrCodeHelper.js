import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Generate a secure QR code value for an event
 * @param {string} eventId - The event ID
 * @returns {string} - The QR code value
 */
export const generateQRCode = async (eventId) => {
  try {
    // Create a unique data string with timestamp and random value
    const timestamp = Date.now();
    const randomValue = crypto.randomBytes(16).toString('hex');
    
    // Sign with JWT for verification and security
    const qrCodeData = jwt.sign(
      { eventId, timestamp, randomValue },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return qrCodeData;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Validate a QR code and extract the event ID
 * @param {string} qrCodeData - The QR code data to validate
 * @returns {string|null} - The event ID if valid, null otherwise
 */
export const validateQRCode = async (qrCodeData) => {
  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(qrCodeData, process.env.JWT_SECRET);
    
    // Return the event ID
    return decoded.eventId;
  } catch (error) {
    console.error('Error validating QR code:', error);
    return null;
  }
};