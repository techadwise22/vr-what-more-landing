// Backup Submissions API - Retrieve backup data from Vercel KV
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are accepted'
    });
  }
  
  try {
    // Check if KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return res.status(500).json({
        error: 'KV not configured',
        message: 'Vercel KV is not configured for this project'
      });
    }
    
    // Get all backup submissions from KV
    const kvResponse = await fetch(`${process.env.KV_REST_API_URL}/keys`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!kvResponse.ok) {
      throw new Error(`KV keys request failed: ${kvResponse.status}`);
    }
    
    const keysData = await kvResponse.json();
    const submissionKeys = keysData.result.filter(key => key.startsWith('submission_'));
    
    const submissions = [];
    
    // Get each submission
    for (const key of submissionKeys) {
      try {
        const getResponse = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (getResponse.ok) {
          const data = await getResponse.json();
          if (data.result) {
            submissions.push(JSON.parse(data.result));
          }
        }
      } catch (error) {
        console.warn(`Failed to get submission ${key}:`, error);
      }
    }
    
    // Sort by submission date (newest first)
    submissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    
    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions: submissions,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Backup retrieval error:', error);
    
    return res.status(500).json({
      error: 'Failed to retrieve backups',
      message: 'Unable to access backup data at this time',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 