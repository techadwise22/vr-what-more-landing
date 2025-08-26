// Security Configuration
export const securityConfig = {
  // API Keys (store in environment variables)
  apiKeys: process.env.API_KEYS?.split(',') || ['vr-what-more-2024-secure-key'],
  
  // Rate Limiting
  rateLimiting: {
    default: {
      limit: 100,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    strict: {
      limit: 10,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    captcha: {
      limit: 20,
      windowMs: 5 * 60 * 1000 // 5 minutes
    }
  },
  
  // CAPTCHA Configuration
  captcha: {
    enabled: true,
    type: process.env.CAPTCHA_TYPE || 'simple', // 'simple' or 'recaptcha'
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
    expirationTime: 5 * 60 * 1000 // 5 minutes
  },
  
  // Spam Protection
  spamProtection: {
    enabled: true,
    honeypotFields: ['website', 'url', 'homepage', 'company'],
    maxSubmissionsPerMinute: 3,
    maxSubmissionsPerHour: 10,
    suspiciousPatterns: [
      /buy.*viagra/i,
      /casino.*online/i,
      /loan.*quick/i,
      /make.*money.*fast/i,
      /click.*here/i,
      /free.*offer/i,
      /limited.*time/i,
      /act.*now/i
    ],
    botPatterns: [
      /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
      /python/i, /java/i, /perl/i, /ruby/i, /php/i, /go-http/i,
      /headless/i, /phantomjs/i, /selenium/i, /puppeteer/i
    ]
  },
  
  // Input Validation
  validation: {
    maxFieldLength: 1000,
    maxTotalLength: 10000, // 10KB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFileSize: 5 * 1024 * 1024 // 5MB
  },
  
  // CSRF Protection
  csrf: {
    enabled: true,
    secret: process.env.CSRF_SECRET || 'vr-what-more-csrf-secret-2024',
    tokenExpiration: 60 * 60 * 1000 // 1 hour
  },
  
  // Security Headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://qyrroegdckqpquglsuru.supabase.co;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  },
  
  // IP Blocking
  ipBlocking: {
    enabled: true,
    blockedIPs: process.env.BLOCKED_IPS?.split(',') || [],
    suspiciousThreshold: 10, // requests per 5 minutes
    blockDuration: 60 * 60 * 1000 // 1 hour
  },
  
  // Logging
  logging: {
    enabled: true,
    level: process.env.LOG_LEVEL || 'info',
    includeHeaders: ['user-agent', 'x-forwarded-for', 'referer'],
    excludePaths: ['/health', '/favicon.ico']
  },
  
  // Environment-specific settings
  environment: {
    development: {
      rateLimiting: {
        default: { limit: 1000, windowMs: 15 * 60 * 1000 },
        strict: { limit: 100, windowMs: 15 * 60 * 1000 }
      },
      logging: { level: 'debug' }
    },
    production: {
      rateLimiting: {
        default: { limit: 100, windowMs: 15 * 60 * 1000 },
        strict: { limit: 10, windowMs: 15 * 60 * 1000 }
      },
      logging: { level: 'warn' }
    }
  }
};

// Get environment-specific config
export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const baseConfig = { ...securityConfig };
  const envConfig = securityConfig.environment[env] || {};
  
  return {
    ...baseConfig,
    ...envConfig,
    environment: env
  };
};

// Validate configuration
export const validateConfig = () => {
  const config = getConfig();
  const errors = [];
  
  // Check required environment variables
  if (!config.apiKeys || config.apiKeys.length === 0) {
    errors.push('API_KEYS environment variable is required');
  }
  
  if (config.captcha.type === 'recaptcha' && !config.captcha.recaptchaSecretKey) {
    errors.push('RECAPTCHA_SECRET_KEY is required when using reCAPTCHA');
  }
  
  if (config.csrf.enabled && !config.csrf.secret) {
    errors.push('CSRF_SECRET environment variable is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return config;
};

// Export validated config
export const config = validateConfig(); 