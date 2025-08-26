// Secure Form Submission API
import { 
  validateApiKey, 
  rateLimiter, 
  validateInput, 
  sanitizeInput,
  logRequest 
} from './middleware/auth.js';

import { 
  comprehensiveSpamCheck,
  verifyCaptcha,
  generateCaptchaChallenge,
  validateCaptchaAnswer
} from './middleware/spam-protection.js';

import { submitFormData, updateSignupCount } from '../supabase-config.js';

// Form validation schema
const formSchema = {
  // Step 1 fields
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/,
    sanitize: 'text'
  },
  email: {
    required: true,
    type: 'email',
    maxLength: 254,
    sanitize: 'email'
  },
  phone: {
    required: true,
    type: 'phone',
    minLength: 10,
    maxLength: 15,
    sanitize: 'phone'
  },
  
  // Step 2 fields
  primaryArea: {
    required: true,
    maxLength: 100,
    sanitize: 'text'
  },
  otherArea: {
    required: false,
    maxLength: 100,
    sanitize: 'text'
  },
  experience: {
    required: true,
    pattern: /^[0-9-]+$/,
    sanitize: 'text'
  },
  organization: {
    required: false,
    maxLength: 200,
    sanitize: 'text'
  },
  role: {
    required: false,
    maxLength: 100,
    sanitize: 'text'
  },
  values: {
    required: true,
    maxLength: 500,
    sanitize: 'text'
  },
  otherValues: {
    required: false,
    maxLength: 200,
    sanitize: 'text'
  },
  priorities: {
    required: true,
    maxLength: 500,
    sanitize: 'text'
  },
  otherPriorities: {
    required: false,
    maxLength: 200,
    sanitize: 'text'
  },
  biggestChallenge: {
    required: true,
    maxLength: 1000,
    sanitize: 'text'
  },
  otherChallenge: {
    required: false,
    maxLength: 200,
    sanitize: 'text'
  },
  streetAddress: {
    required: true,
    maxLength: 200,
    sanitize: 'text'
  },
  locality: {
    required: true,
    maxLength: 100,
    sanitize: 'text'
  },
  landmark: {
    required: false,
    maxLength: 100,
    sanitize: 'text'
  },
  city: {
    required: true,
    maxLength: 100,
    sanitize: 'text'
  },
  state: {
    required: true,
    maxLength: 100,
    sanitize: 'text'
  },
  otherState: {
    required: false,
    maxLength: 100,
    sanitize: 'text'
  },
  pinCode: {
    required: true,
    pattern: /^[0-9]{6}$/,
    sanitize: 'text'
  },
  birthday: {
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    sanitize: 'text'
  },
  skipBirthday: {
    required: false,
    sanitize: 'text'
  },
  wasStudent: {
    required: true,
    pattern: /^(yes|no)$/i,
    sanitize: 'text'
  },
  batchYear: {
    required: false,
    maxLength: 20,
    sanitize: 'text'
  },
  instituteName: {
    required: false,
    maxLength: 200,
    sanitize: 'text'
  },
  
  // Security fields
  captchaToken: {
    required: true,
    maxLength: 1000,
    sanitize: 'text'
  },
  captchaAnswer: {
    required: false,
    maxLength: 50,
    sanitize: 'text'
  },
  
  // Honeypot fields (should be empty)
  website: {
    required: false,
    maxLength: 0, // Should be empty
    sanitize: 'text'
  }
};

export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }
  
  try {
    // 1. API Key Authentication
    const authResult = validateApiKey(req);
    if (!authResult.valid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: authResult.error
      });
    }
    
    // 2. Rate Limiting
    const rateLimitResult = rateLimiter(req, 10, 15 * 60 * 1000); // 10 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: rateLimitResult.error,
        retryAfter: Math.ceil(15 * 60 / 60) // minutes
      });
    }
    
    // 3. Log request for security monitoring
    logRequest(req, res, () => {});
    
    // 4. Parse and validate request body
    let formData;
    try {
      formData = JSON.parse(req.body);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      });
    }
    
    // 5. Input validation and sanitization
    const validationResult = validateInput(formData, formSchema);
    if (!validationResult.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: validationResult.errors
      });
    }
    
    // 6. Comprehensive spam protection
    const spamCheck = await comprehensiveSpamCheck(req, formData);
    if (spamCheck.isSpam) {
      console.warn('Spam detected:', {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        reasons: spamCheck.reasons,
        score: spamCheck.score
      });
      
      return res.status(403).json({
        error: 'Spam detected',
        message: 'Your submission appears to be spam',
        details: spamCheck.reasons
      });
    }
    
    // 7. CAPTCHA verification
    if (process.env.RECAPTCHA_SECRET_KEY) {
      const captchaValid = await verifyCaptcha(
        formData.captchaToken, 
        process.env.RECAPTCHA_SECRET_KEY
      );
      
      if (!captchaValid) {
        return res.status(400).json({
          error: 'CAPTCHA verification failed',
          message: 'Please complete the CAPTCHA verification'
        });
      }
    } else {
      // Fallback to simple CAPTCHA
      if (formData.captchaAnswer && formData.captchaChallenge) {
        const simpleCaptchaValid = validateCaptchaAnswer(
          formData.captchaAnswer,
          formData.captchaChallenge
        );
        
        if (!simpleCaptchaValid) {
          return res.status(400).json({
            error: 'CAPTCHA verification failed',
            message: 'Incorrect CAPTCHA answer'
          });
        }
      }
    }
    
    // 8. Additional security checks
    const securityChecks = performSecurityChecks(formData);
    if (!securityChecks.passed) {
      return res.status(400).json({
        error: 'Security check failed',
        message: securityChecks.message
      });
    }
    
    // 9. Submit data to database
    const submissionResult = await submitFormData(formData);
    
    if (submissionResult.success) {
      // 10. Update signup count
      await updateSignupCount();
      
      // 11. Track with analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          'event_category': 'engagement',
          'event_label': 'waitlist_signup_secure'
        });
      }
      
      // 12. Return success response
      return res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        submissionId: submissionResult.step1Id,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        error: 'Submission failed',
        message: 'Unable to save your submission. Please try again.',
        details: submissionResult.error
      });
    }
    
  } catch (error) {
    console.error('Form submission error:', error);
    
    // Don't expose internal errors to client
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
}

// Additional security checks
function performSecurityChecks(formData) {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i
  ];
  
  const dataString = JSON.stringify(formData).toLowerCase();
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(dataString)) {
      return {
        passed: false,
        message: 'Suspicious content detected'
      };
    }
  }
  
  // Check for excessive data
  const totalLength = Object.values(formData).join('').length;
  if (totalLength > 10000) { // 10KB limit
    return {
      passed: false,
      message: 'Data too large'
    };
  }
  
  // Check for duplicate submissions (basic check)
  const email = formData.email?.toLowerCase();
  if (email && recentSubmissions.has(email)) {
    return {
      passed: false,
      message: 'Duplicate submission detected'
    };
  }
  
  // Add to recent submissions
  if (email) {
    recentSubmissions.set(email, Date.now());
    
    // Clean up old entries (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [key, timestamp] of recentSubmissions.entries()) {
      if (timestamp < oneHourAgo) {
        recentSubmissions.delete(key);
      }
    }
  }
  
  return { passed: true };
}

// Track recent submissions to prevent duplicates
const recentSubmissions = new Map(); 