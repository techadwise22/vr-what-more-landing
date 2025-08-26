// CAPTCHA API Endpoint
import { rateLimiter, logRequest } from './middleware/auth.js';
import { generateCaptchaChallenge, validateCaptchaAnswer } from './middleware/spam-protection.js';

// Store CAPTCHA challenges (in production, use Redis)
const captchaStore = new Map();

export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Log request
  logRequest(req, res, () => {});
  
  if (req.method === 'GET') {
    // Generate new CAPTCHA challenge
    try {
      // Rate limiting for CAPTCHA generation
      const rateLimitResult = rateLimiter(req, 20, 5 * 60 * 1000); // 20 requests per 5 minutes
      if (!rateLimitResult.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many CAPTCHA requests'
        });
      }
      
      const captcha = generateCaptchaChallenge();
      
      // Store challenge with expiration (5 minutes)
      captchaStore.set(captcha.token, {
        challenge: captcha.challenge,
        answer: captcha.answer,
        expiresAt: Date.now() + (5 * 60 * 1000)
      });
      
      // Clean up expired challenges
      cleanupExpiredChallenges();
      
      return res.status(200).json({
        success: true,
        token: captcha.token,
        challenge: captcha.challenge,
        expiresIn: 300 // 5 minutes
      });
      
    } catch (error) {
      console.error('CAPTCHA generation error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to generate CAPTCHA'
      });
    }
    
  } else if (req.method === 'POST') {
    // Validate CAPTCHA answer
    try {
      const { token, answer } = req.body;
      
      if (!token || !answer) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'Token and answer are required'
        });
      }
      
      const storedChallenge = captchaStore.get(token);
      
      if (!storedChallenge) {
        return res.status(400).json({
          error: 'Invalid token',
          message: 'CAPTCHA token not found or expired'
        });
      }
      
      if (Date.now() > storedChallenge.expiresAt) {
        captchaStore.delete(token);
        return res.status(400).json({
          error: 'Token expired',
          message: 'CAPTCHA token has expired'
        });
      }
      
      const isValid = validateCaptchaAnswer(answer, storedChallenge.answer);
      
      // Remove challenge after validation (one-time use)
      captchaStore.delete(token);
      
      return res.status(200).json({
        success: true,
        valid: isValid,
        message: isValid ? 'CAPTCHA validated successfully' : 'Incorrect answer'
      });
      
    } catch (error) {
      console.error('CAPTCHA validation error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to validate CAPTCHA'
      });
    }
    
  } else {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET and POST requests are accepted'
    });
  }
}

// Clean up expired challenges
function cleanupExpiredChallenges() {
  const now = Date.now();
  for (const [token, challenge] of captchaStore.entries()) {
    if (now > challenge.expiresAt) {
      captchaStore.delete(token);
    }
  }
} 