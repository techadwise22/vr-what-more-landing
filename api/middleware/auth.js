// Authentication Middleware
import crypto from 'crypto';

// API Key validation
export const validateApiKey = (req) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return { valid: false, error: 'API key required' };
  }

  // In production, store API keys in environment variables or database
  const validApiKeys = process.env.API_KEYS?.split(',') || ['vr-what-more-2024-secure-key'];
  
  if (!validApiKeys.includes(apiKey)) {
    return { valid: false, error: 'Invalid API key' };
  }

  return { valid: true };
};

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

export const rateLimiter = (req, limit = 100, windowMs = 15 * 60 * 1000) => {
  const key = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  const record = rateLimitStore.get(key);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, error: 'Rate limit exceeded' };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
};

// Input validation and sanitization
export const validateInput = (data, schema) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (!value || value.trim() === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value) {
      // Length validation
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be no more than ${rules.maxLength} characters`);
      }
      
      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
      
      // Type validation
      if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email address`);
      }
      
      if (rules.type === 'phone' && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
        errors.push(`${field} must be a valid phone number`);
      }
      
      // Sanitize input
      if (rules.sanitize) {
        data[field] = sanitizeInput(value, rules.sanitize);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
};

// Input sanitization
export const sanitizeInput = (input, type = 'text') => {
  if (typeof input !== 'string') return input;
  
  switch (type) {
    case 'html':
      return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    
    case 'email':
      return input.toLowerCase().trim();
    
    case 'phone':
      return input.replace(/[^\d\+]/g, '');
    
    case 'text':
    default:
      return input.trim();
  }
};

// CSRF protection
export const validateCSRF = (req) => {
  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.headers['x-session-token'];
  
  if (!csrfToken || !sessionToken) {
    return { valid: false, error: 'CSRF token required' };
  }
  
  // In production, validate against stored session token
  const expectedToken = crypto
    .createHash('sha256')
    .update(sessionToken + process.env.CSRF_SECRET)
    .digest('hex');
  
  if (csrfToken !== expectedToken) {
    return { valid: false, error: 'Invalid CSRF token' };
  }
  
  return { valid: true };
};

// Request logging for security monitoring
export const logRequest = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    referer: req.headers['referer']
  };
  
  console.log('API Request:', JSON.stringify(logData));
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service (e.g., LogRocket, Sentry)
  }
  
  next();
}; 