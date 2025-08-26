// Enhanced Supabase Configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qyrroegdckqpquglsuru.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cnJvZWdkY2txcHF1Z2xzdXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDEzNTUsImV4cCI6MjA3MTgxNzM1NX0.NTSqSELIjJF1OSVO9IcjCA3tpzfFix7uMppvDeNejcc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced database functions for form submission
export const submitFormData = async (formData) => {
  try {
    // Insert step 1 data with LinkedIn URL
    const { data: step1Data, error: step1Error } = await supabase
      .from('basic_info')
      .insert([
        {
          full_name: formData.fullName,
          email: formData.email.toLowerCase(),
          phone: formData.phone,
          linkedin_url: formData.linkedin || null,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (step1Error) {
      console.error('Step 1 insertion error:', step1Error);
      throw step1Error;
    }

    // Insert step 2 data with enhanced fields
    const { data: step2Data, error: step2Error } = await supabase
      .from('professional_details')
      .insert([
        {
          basic_info_id: step1Data[0].id,
          primary_area: formData.primaryArea,
          other_area: formData.otherArea || null,
          experience_years: formData.experience,
          organization: formData.organization || null,
          role: formData.role || null,
          values: formData.values || [],
          other_values: formData.otherValues || null,
          priorities: formData.priorities || [],
          other_priorities: formData.otherPriorities || null,
          biggest_challenge: formData.biggestChallenge || [],
          other_challenge: formData.otherChallenge || null,
          street_address: formData.streetAddress,
          locality: formData.locality,
          landmark: formData.landmark || null,
          city: formData.city,
          state: formData.state,
          other_state: formData.otherState || null,
          pin_code: formData.pinCode,
          birthday: formData.birthday || null,
          skip_birthday: formData.skipBirthday || false,
          was_student: formData.wasStudent,
          batch_year: formData.batchYear || null,
          institute_name: formData.instituteName || null,
          captcha_token: formData.captchaToken || null,
          captcha_verified: formData.captchaVerified || false,
          honeypot_website: formData.honeypotWebsite || null,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (step2Error) {
      console.error('Step 2 insertion error:', step2Error);
      // If step 2 fails, we should clean up step 1
      await supabase
        .from('basic_info')
        .delete()
        .eq('id', step1Data[0].id);
      throw step2Error;
    }

    return {
      success: true,
      step1Id: step1Data[0].id,
      step2Id: step2Data[0].id,
      message: 'Form submitted successfully'
    }

  } catch (error) {
    console.error('Error submitting form data:', error);
    return {
      success: false,
      error: error.message || 'Database submission failed'
    }
  }
}

// Update signup count with enhanced error handling
export const updateSignupCount = async () => {
  try {
    // Use the database function to increment count
    const { data, error } = await supabase
      .rpc('increment_signup_count')

    if (error) {
      console.error('Error updating signup count:', error);
      throw error;
    }

    return { 
      success: true, 
      newCount: data,
      message: 'Signup count updated successfully'
    };
  } catch (error) {
    console.error('Error updating signup count:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update signup count'
    };
  }
}

// Get current signup count with enhanced error handling
export const getSignupCount = async () => {
  try {
    // Use the database function to get current count
    const { data, error } = await supabase
      .rpc('get_signup_count')

    if (error) {
      console.error('Error getting signup count:', error);
      throw error;
    }

    return {
      success: true,
      count: data || 249,
      message: 'Signup count retrieved successfully'
    };
  } catch (error) {
    console.error('Error getting signup count:', error);
    return {
      success: false,
      count: 249, // Fallback count
      error: error.message || 'Failed to get signup count'
    };
  }
}

// Get all submissions (for admin purposes)
export const getAllSubmissions = async (limit = 100, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('basic_info')
      .select(`
        *,
        professional_details (*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      success: true,
      data: data,
      count: data.length
    };
  } catch (error) {
    console.error('Error getting submissions:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get submission by email
export const getSubmissionByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('basic_info')
      .select(`
        *,
        professional_details (*)
      `)
      .eq('email', email.toLowerCase())
      .single()

    if (error) throw error

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error getting submission by email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Log security events
export const logSecurityEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('security_logs')
      .insert([
        {
          ip_address: eventData.ip_address,
          user_agent: eventData.user_agent,
          request_path: eventData.request_path,
          request_method: eventData.request_method,
          status_code: eventData.status_code,
          spam_score: eventData.spam_score || 0,
          blocked: eventData.blocked || false,
          reason: eventData.reason || null,
          created_at: new Date().toISOString()
        }
      ])

    if (error) throw error

    return { success: true, data };
  } catch (error) {
    console.error('Error logging security event:', error);
    return { success: false, error: error.message };
  }
}

// Health check function
export const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('signup_stats')
      .select('count')
      .limit(1)

    if (error) throw error

    return {
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
} 