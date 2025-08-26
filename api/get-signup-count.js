// Vercel serverless function for getting signup count
import { db } from '../../database.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current signup count
    const count = await db.getSignupCount();

    // Return the count
    return res.status(200).json({
      success: true,
      count: count
    });

  } catch (error) {
    console.error('Error getting signup count:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      count: 0
    });
  }
} 