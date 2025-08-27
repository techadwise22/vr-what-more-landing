// Test API endpoint to verify routing
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'ok' });
  }
  
  // Return test response
  return res.status(200).json({
    success: true,
    message: 'API is working correctly!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
} 