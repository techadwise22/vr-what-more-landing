// Supabase Configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qyrroegdckqpquglsuru.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cnJvZWdkY2txcHF1Z2xzdXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDEzNTUsImV4cCI6MjA3MTgxNzM1NX0.NTSqSELIjJF1OSVO9IcjCA3tpzfFix7uMppvDeNejcc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database functions for form submission
export const submitFormData = async (formData) => {
  try {
    // Insert step 1 data
    const { data: step1Data, error: step1Error } = await supabase
      .from('basic_info')
      .insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (step1Error) throw step1Error

    // Insert step 2 data
    const { data: step2Data, error: step2Error } = await supabase
      .from('professional_details')
      .insert([
        {
          basic_info_id: step1Data[0].id,
          primary_area: formData.primaryArea,
          other_area: formData.otherArea || null,
          experience_years: formData.experience,
          organization: formData.organization,
          role: formData.role,
          values: formData.values,
          other_values: formData.otherValues || null,
          priorities: formData.priorities,
          other_priorities: formData.otherPriorities || null,
          biggest_challenge: formData.biggestChallenge,
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
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (step2Error) throw step2Error

    return {
      success: true,
      step1Id: step1Data[0].id,
      step2Id: step2Data[0].id
    }

  } catch (error) {
    console.error('Error submitting form data:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Update signup count
export const updateSignupCount = async () => {
  try {
    const { data, error } = await supabase
      .from('signup_stats')
      .select('count')
      .single()

    if (error && error.code !== 'PGRST116') throw error

    if (data) {
      // Update existing count
      const { error: updateError } = await supabase
        .from('signup_stats')
        .update({ 
          count: data.count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)

      if (updateError) throw updateError
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('signup_stats')
        .insert([
          {
            count: 1,
            created_at: new Date().toISOString()
          }
        ])

      if (insertError) throw insertError
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating signup count:', error)
    return { success: false, error: error.message }
  }
}

// Get current signup count
export const getSignupCount = async () => {
  try {
    const { data, error } = await supabase
      .from('signup_stats')
      .select('count')
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return data ? data.count : 0
  } catch (error) {
    console.error('Error getting signup count:', error)
    return 0
  }
} 