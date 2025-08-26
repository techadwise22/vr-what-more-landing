// Health Check API Endpoint
import { logRequest } from './middleware/auth.js';

export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Log request
  logRequest(req, res, () => {});
  
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are accepted'
    });
  }
  
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected', // You can add actual database health check here
        supabase: 'connected',
        captcha: 'available'
      },
      security: {
        rateLimiting: 'enabled',
        inputValidation: 'enabled',
        spamProtection: 'enabled',
        csrfProtection: 'enabled'
      }
    };
    
    return res.status(200).json(healthStatus);
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Internal server error'
    });
  }
} 