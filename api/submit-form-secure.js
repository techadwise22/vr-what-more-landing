// Enhanced Secure Form Submission API
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
  validateCaptchaAnswer
} from './middleware/spam-protection.js';

import { submitFormData, updateSignupCount } from '../supabase-config.js';

// Enhanced form validation schema
const formSchema = {
  // Step 1 fields
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\u00C0-\u017F]+$/,
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
  linkedin: {
    required: false,
    type: 'url',
    pattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/,
    maxLength: 500,
    sanitize: 'text'
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
    pattern: /^[0-9\-\+]+$/,
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
    type: 'array',
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
    type: 'array',
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
    type: 'array',
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
    type: 'boolean',
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
    required: false,
    maxLength: 1000,
    sanitize: 'text'
  },
  captchaAnswer: {
    required: true,
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
  // Set comprehensive security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
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
    
    // 2. Rate Limiting (stricter for form submissions)
    const rateLimitResult = rateLimiter(req, 5, 15 * 60 * 1000); // 5 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many form submissions. Please wait before trying again.',
        retryAfter: Math.ceil(15 * 60 / 60) // minutes
      });
    }
    
    // 3. Log request for security monitoring
    logRequest(req, res, () => {});
    
    // 4. Parse and validate request body
    let formData;
    try {
      formData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      });
    }
    
    // 5. Flatten nested form data structure
    const flattenedData = {
      ...formData.step1,
      ...formData.step2
    };
    
    // 6. Input validation and sanitization
    const validationResult = validateInput(flattenedData, formSchema);
    if (!validationResult.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input and try again.',
        details: validationResult.errors
      });
    }
    
    // 7. Comprehensive spam protection
    const spamCheck = await comprehensiveSpamCheck(req, flattenedData);
    if (spamCheck.isSpam) {
      console.warn('Spam detected:', {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        reasons: spamCheck.reasons,
        score: spamCheck.score,
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({
        error: 'Spam detected',
        message: 'Your submission appears to be spam. Please try again.',
        details: spamCheck.reasons
      });
    }
    
    // 8. CAPTCHA verification
    let captchaValid = false;
    
    if (process.env.RECAPTCHA_SECRET_KEY && flattenedData.captchaToken) {
      // Google reCAPTCHA verification
      captchaValid = await verifyCaptcha(
        flattenedData.captchaToken, 
        process.env.RECAPTCHA_SECRET_KEY
      );
    } else if (flattenedData.captchaAnswer) {
      // Simple CAPTCHA verification (fallback)
      // Note: In production, you should store and validate against the actual challenge
      // For now, we'll validate against simple math operations
      captchaValid = validateSimpleCaptcha(flattenedData.captchaAnswer);
    }
    
    if (!captchaValid) {
      return res.status(400).json({
        error: 'CAPTCHA verification failed',
        message: 'Please complete the security verification correctly.'
      });
    }
    
    // 9. Additional security checks
    const securityChecks = performAdvancedSecurityChecks(flattenedData, req);
    if (!securityChecks.passed) {
      return res.status(400).json({
        error: 'Security check failed',
        message: securityChecks.message
      });
    }
    
    // 10. Prepare data for database insertion
    const dbData = {
      // Step 1 data
      fullName: flattenedData.fullName,
      email: flattenedData.email.toLowerCase(),
      phone: flattenedData.phone,
      linkedin: flattenedData.linkedin || null,
      
      // Step 2 data
      primaryArea: flattenedData.primaryArea,
      otherArea: flattenedData.otherArea || null,
      experience: flattenedData.experience,
      organization: flattenedData.organization || null,
      role: flattenedData.role || null,
      values: Array.isArray(flattenedData.values) ? flattenedData.values : [flattenedData.values],
      otherValues: flattenedData.otherValues || null,
      priorities: Array.isArray(flattenedData.priorities) ? flattenedData.priorities : [flattenedData.priorities],
      otherPriorities: flattenedData.otherPriorities || null,
      biggestChallenge: Array.isArray(flattenedData.biggestChallenge) ? flattenedData.biggestChallenge : [flattenedData.biggestChallenge],
      otherChallenge: flattenedData.otherChallenge || null,
      streetAddress: flattenedData.streetAddress,
      locality: flattenedData.locality,
      landmark: flattenedData.landmark || null,
      city: flattenedData.city,
      state: flattenedData.state,
      otherState: flattenedData.otherState || null,
      pinCode: flattenedData.pinCode,
      birthday: flattenedData.birthday || null,
      skipBirthday: flattenedData.skipBirthday || false,
      wasStudent: flattenedData.wasStudent,
      batchYear: flattenedData.batchYear || null,
      instituteName: flattenedData.instituteName || null,
      captchaToken: flattenedData.captchaToken || null,
      captchaVerified: captchaValid,
      honeypotWebsite: flattenedData.website || null
    };
    
    // 11. Submit data to database
    const submissionResult = await submitFormData(dbData);
    
    if (submissionResult.success) {
      // 12. Update signup count
      await updateSignupCount();
      
      // 13. Track with analytics
      console.log('Form submitted successfully:', {
        submissionId: submissionResult.step1Id,
        email: dbData.email,
        timestamp: new Date().toISOString()
      });
      
      // 14. Return success response
      return res.status(200).json({
        success: true,
        message: 'Welcome to the More Movement! Check your email for next steps.',
        submissionId: submissionResult.step1Id,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Database submission failed:', submissionResult.error);
      return res.status(500).json({
        error: 'Submission failed',
        message: 'Unable to save your submission. Please try again.',
        details: process.env.NODE_ENV === 'development' ? submissionResult.error : undefined
      });
    }
    
  } catch (error) {
    console.error('Form submission error:', error);
    
    // Don't expose internal errors to client
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Validate simple CAPTCHA (fallback)
function validateSimpleCaptcha(userAnswer) {
  // This is a simplified validation
  // In production, you should store and validate against the actual challenge
  const answer = parseInt(userAnswer);
  return !isNaN(answer) && answer >= 0 && answer <= 100;
}

// Advanced security checks
function performAdvancedSecurityChecks(formData, req) {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
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
  if (totalLength > 15000) { // 15KB limit
    return {
      passed: false,
      message: 'Data too large'
    };
  }
  
  // Check honeypot field
  if (formData.website && formData.website.trim() !== '') {
    return {
      passed: false,
      message: 'Spam detected via honeypot'
    };
  }
  
  // Check for duplicate email submissions (basic check)
  const email = formData.email?.toLowerCase();
  if (email && recentSubmissions.has(email)) {
    const lastSubmission = recentSubmissions.get(email);
    const timeDiff = Date.now() - lastSubmission;
    
    if (timeDiff < 5 * 60 * 1000) { // 5 minutes
      return {
        passed: false,
        message: 'Duplicate submission detected'
      };
    }
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
  
  // Check request timing (too fast submissions)
  const userAgent = req.headers['user-agent'] || '';
  if (requestTimings.has(userAgent)) {
    const lastRequest = requestTimings.get(userAgent);
    const timeDiff = Date.now() - lastRequest;
    
    if (timeDiff < 30 * 1000) { // 30 seconds
      return {
        passed: false,
        message: 'Submission too fast'
      };
    }
  }
  
  requestTimings.set(userAgent, Date.now());
  
  return { passed: true };
}

// Track recent submissions and request timings
const recentSubmissions = new Map();
const requestTimings = new Map();

// Clean up old tracking data periodically
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  // Clean submissions
  for (const [key, timestamp] of recentSubmissions.entries()) {
    if (timestamp < oneHourAgo) {
      recentSubmissions.delete(key);
    }
  }
  
  // Clean request timings
  for (const [key, timestamp] of requestTimings.entries()) {
    if (timestamp < oneHourAgo) {
      requestTimings.delete(key);
    }
  }
}, 10 * 60 * 1000); // Clean every 10 minutes 