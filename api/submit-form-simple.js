// Simplified Form Submission API with Database Backup
// This API directly connects to Supabase and includes backup functionality

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }
  
  try {
    // Parse request body
    let formData;
    try {
      formData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      });
    }
    
    // Basic validation
    if (!formData.step1 || !formData.step2) {
      return res.status(400).json({
        error: 'Invalid form data',
        message: 'Form data must include step1 and step2'
      });
    }
    
    if (!formData.step1.fullName || !formData.step1.email || !formData.step1.phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please fill in all required fields in Step 1'
      });
    }
    
    if (!formData.step2.primaryArea || !formData.step2.experience || !formData.step2.streetAddress) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please fill in all required fields in Step 2'
      });
    }
    
    // Supabase configuration
    const supabaseUrl = 'https://qyrroegdckqpquglsuru.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cnJvZWdkY2txcHF1Z2xzdXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDEzNTUsImV4cCI6MjA3MTgxNzM1NX0.NTSqSELIjJF1OSVO9IcjCA3tpzfFix7uMppvDeNejcc';
    
    // Check if email already exists
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/basic_info?email=eq.${encodeURIComponent(formData.step1.email)}&select=email`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (checkResponse.ok) {
      const existingUsers = await checkResponse.json();
      if (existingUsers && existingUsers.length > 0) {
        return res.status(400).json({
          error: 'Email already registered',
          message: 'This email address is already registered. Please use a different email.'
        });
      }
    }
    
    // Prepare basic info
    const basicInfo = {
      full_name: formData.step1.fullName,
      email: formData.step1.email.toLowerCase(),
      phone: formData.step1.phone,
      linkedin_url: formData.step1.linkedin || null
    };
    
    // Insert basic info
    const basicResponse = await fetch(`${supabaseUrl}/rest/v1/basic_info`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(basicInfo)
    });
    
    if (!basicResponse.ok) {
      const errorData = await basicResponse.json();
      console.error('Basic info error:', errorData);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to save basic information. Please try again.'
      });
    }
    
    const basicResult = await basicResponse.json();
    console.log('Basic info inserted successfully:', basicResult);
    
    // Prepare professional details
    const professionalDetails = {
      email: formData.step1.email.toLowerCase(),
      primary_area: formData.step2.primaryArea === 'Others (Specify)' ? 
        (formData.step2.otherPrimaryArea || 'Other') : formData.step2.primaryArea,
      experience: formData.step2.experience,
      organization: formData.step2.organization || null,
      role: formData.step2.role || null,
      values: Array.isArray(formData.step2.values) ? formData.step2.values.join(', ') : (formData.step2.values || ''),
      priorities: Array.isArray(formData.step2.priorities) ? formData.step2.priorities.join(', ') : (formData.step2.priorities || ''),
      biggest_challenge: Array.isArray(formData.step2.biggestChallenge) ? formData.step2.biggestChallenge.join(', ') : (formData.step2.biggestChallenge || ''),
      street_address: formData.step2.streetAddress,
      locality: formData.step2.locality,
      landmark: formData.step2.landmark || null,
      city: formData.step2.city,
      state: formData.step2.state,
      pin_code: formData.step2.pinCode,
      birthday: formData.step2.birthday || null,
      skip_birthday: formData.step2.skipBirthday || false,
      was_student: formData.step2.wasStudent,
      batch_year: formData.step2.batchYear || null,
      institute_name: formData.step2.instituteName || null,
      captcha_token: formData.step2.captchaToken || null,
      captcha_verified: true,
      honeypot_website: formData.step2.website || null
    };
    
    // Insert professional details
    const profResponse = await fetch(`${supabaseUrl}/rest/v1/professional_details`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(professionalDetails)
    });
    
    if (!profResponse.ok) {
      const errorData = await profResponse.json();
      console.error('Professional details error:', errorData);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to save professional details. Please try again.'
      });
    }
    
    const profResult = await profResponse.json();
    console.log('Professional details inserted successfully:', profResult);
    
    // Update signup count
    try {
      const countResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_signup_count`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (countResponse.ok) {
        console.log('Signup count updated successfully');
      } else {
        console.warn('Signup count update failed:', countResponse.statusText);
      }
    } catch (countError) {
      console.warn('Signup count update failed:', countError);
    }
    
    // Create backup in Vercel KV (if available)
    try {
      const backupData = {
        id: basicResult[0]?.id || Date.now().toString(),
        basic_info: basicInfo,
        professional_details: professionalDetails,
        submitted_at: new Date().toISOString(),
        source: 'vercel-api'
      };
      
      // Store in Vercel KV as backup (if KV is configured)
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const kvResponse = await fetch(`${process.env.KV_REST_API_URL}/set`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: `submission_${backupData.id}`,
            value: JSON.stringify(backupData),
            expiration: 30 * 24 * 60 * 60 // 30 days
          })
        });
        
        if (kvResponse.ok) {
          console.log('Backup stored in Vercel KV successfully');
        }
      }
    } catch (backupError) {
      console.warn('Backup creation failed:', backupError);
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Welcome to the More Movement! Your submission has been received.',
      submissionId: basicResult[0]?.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Form submission error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
} 