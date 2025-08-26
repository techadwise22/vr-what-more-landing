// Spam Protection Middleware
import crypto from 'crypto';

// IP blocking storage (in production, use Redis)
const blockedIPs = new Set();
const suspiciousIPs = new Map();

// CAPTCHA verification
export const verifyCaptcha = async (captchaToken, secretKey) => {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${captchaToken}`,
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return false;
  }
};

// Bot detection
export const detectBot = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
    /python/i, /java/i, /perl/i, /ruby/i, /php/i, /go-http/i,
    /headless/i, /phantomjs/i, /selenium/i, /puppeteer/i
  ];

  // Check for bot patterns in user agent
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  // Check for missing or suspicious headers
  const missingHeaders = !req.headers['accept-language'] || 
                        !req.headers['accept-encoding'] ||
                        !req.headers['dnt'];
  
  // Check for suspicious behavior patterns
  const suspiciousBehavior = checkSuspiciousBehavior(req);
  
  return {
    isBot,
    missingHeaders,
    suspiciousBehavior,
    score: (isBot ? 0.8 : 0) + (missingHeaders ? 0.1 : 0) + (suspiciousBehavior ? 0.1 : 0)
  };
};

// Check for suspicious behavior
const checkSuspiciousBehavior = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
  
  if (!suspiciousIPs.has(ip)) {
    suspiciousIPs.set(ip, { count: 1, firstSeen: Date.now() });
    return false;
  }
  
  const record = suspiciousIPs.get(ip);
  const timeWindow = 5 * 60 * 1000; // 5 minutes
  const maxRequests = 10;
  
  if (Date.now() - record.firstSeen > timeWindow) {
    record.count = 1;
    record.firstSeen = Date.now();
    return false;
  }
  
  record.count++;
  
  if (record.count > maxRequests) {
    blockedIPs.add(ip);
    return true;
  }
  
  return false;
};

// IP blocking
export const isIPBlocked = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
  return blockedIPs.has(ip);
};

// Honeypot field detection
export const checkHoneypot = (data) => {
  const honeypotFields = ['website', 'url', 'homepage', 'company'];
  
  for (const field of honeypotFields) {
    if (data[field] && data[field].trim() !== '') {
      return { isSpam: true, reason: 'Honeypot field filled' };
    }
  }
  
  return { isSpam: false };
};

// Time-based spam detection
export const checkTimeBasedSpam = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!suspiciousIPs.has(ip)) {
    suspiciousIPs.set(ip, { submissions: [] });
  }
  
  const record = suspiciousIPs.get(ip);
  const timeWindow = 60 * 1000; // 1 minute
  const maxSubmissions = 3;
  
  // Remove old submissions
  record.submissions = record.submissions.filter(time => now - time < timeWindow);
  
  // Check if too many submissions in time window
  if (record.submissions.length >= maxSubmissions) {
    return { isSpam: true, reason: 'Too many submissions in short time' };
  }
  
  record.submissions.push(now);
  return { isSpam: false };
};

// Content-based spam detection
export const checkContentSpam = (data) => {
  const spamPatterns = [
    /buy.*viagra/i,
    /casino.*online/i,
    /loan.*quick/i,
    /make.*money.*fast/i,
    /click.*here/i,
    /free.*offer/i,
    /limited.*time/i,
    /act.*now/i
  ];
  
  const textContent = JSON.stringify(data).toLowerCase();
  
  for (const pattern of spamPatterns) {
    if (pattern.test(textContent)) {
      return { isSpam: true, reason: 'Spam content detected' };
    }
  }
  
  return { isSpam: false };
};

// Request throttling
export const throttleRequest = (req, limit = 5, windowMs = 60 * 1000) => {
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!suspiciousIPs.has(ip)) {
    suspiciousIPs.set(ip, { requests: [] });
  }
  
  const record = suspiciousIPs.get(ip);
  
  // Remove old requests
  record.requests = record.requests.filter(time => now - time < windowMs);
  
  if (record.requests.length >= limit) {
    return { allowed: false, error: 'Request throttled' };
  }
  
  record.requests.push(now);
  return { allowed: true, remaining: limit - record.requests.length };
};

// Generate CAPTCHA challenge
export const generateCaptchaChallenge = () => {
  const challenge = Math.random().toString(36).substring(2, 8);
  const answer = challenge.split('').reverse().join('');
  
  return {
    challenge: `Please reverse: ${challenge}`,
    answer,
    token: crypto.randomBytes(32).toString('hex')
  };
};

// Validate CAPTCHA answer
export const validateCaptchaAnswer = (userAnswer, expectedAnswer) => {
  return userAnswer.toLowerCase() === expectedAnswer.toLowerCase();
};

// Comprehensive spam check
export const comprehensiveSpamCheck = async (req, data) => {
  const results = {
    isSpam: false,
    reasons: [],
    score: 0
  };
  
  // Check IP blocking
  if (isIPBlocked(req)) {
    results.isSpam = true;
    results.reasons.push('IP is blocked');
    results.score += 1.0;
  }
  
  // Check bot detection
  const botDetection = detectBot(req);
  if (botDetection.score > 0.5) {
    results.isSpam = true;
    results.reasons.push('Bot detected');
    results.score += botDetection.score;
  }
  
  // Check honeypot
  const honeypotCheck = checkHoneypot(data);
  if (honeypotCheck.isSpam) {
    results.isSpam = true;
    results.reasons.push(honeypotCheck.reason);
    results.score += 1.0;
  }
  
  // Check time-based spam
  const timeCheck = checkTimeBasedSpam(req);
  if (timeCheck.isSpam) {
    results.isSpam = true;
    results.reasons.push(timeCheck.reason);
    results.score += 0.8;
  }
  
  // Check content spam
  const contentCheck = checkContentSpam(data);
  if (contentCheck.isSpam) {
    results.isSpam = true;
    results.reasons.push(contentCheck.reason);
    results.score += 0.6;
  }
  
  // Check request throttling
  const throttleCheck = throttleRequest(req);
  if (!throttleCheck.allowed) {
    results.isSpam = true;
    results.reasons.push(throttleCheck.error);
    results.score += 0.5;
  }
  
  return results;
}; 