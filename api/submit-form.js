// Vercel serverless function for form submission
import { db } from '../../database.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone) {
      return res.status(400).json({ 
        error: 'Missing required fields: fullName, email, phone' 
      });
    }

    // Insert basic info first
    const basicInfoResult = await db.insertBasicInfo({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone
    });

    if (!basicInfoResult.success) {
      return res.status(500).json({ 
        error: 'Failed to save basic information' 
      });
    }

    // Insert professional details
    const professionalDetailsResult = await db.insertProfessionalDetails(
      basicInfoResult.data.id,
      {
        primaryArea: formData.primaryArea,
        otherArea: formData.otherArea,
        experience: formData.experience,
        organization: formData.organization,
        role: formData.role,
        values: formData.values,
        otherValues: formData.otherValues,
        priorities: formData.priorities,
        otherPriorities: formData.otherPriorities,
        biggestChallenge: formData.biggestChallenge,
        otherChallenge: formData.otherChallenge,
        streetAddress: formData.streetAddress,
        locality: formData.locality,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        otherState: formData.otherState,
        pinCode: formData.pinCode,
        birthday: formData.birthday,
        skipBirthday: formData.skipBirthday,
        wasStudent: formData.wasStudent,
        batchYear: formData.batchYear,
        instituteName: formData.instituteName
      }
    );

    if (!professionalDetailsResult.success) {
      return res.status(500).json({ 
        error: 'Failed to save professional details' 
      });
    }

    // Update signup count
    await db.updateSignupCount();

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      data: {
        basicInfoId: basicInfoResult.data.id,
        professionalDetailsId: professionalDetailsResult.data.id
      }
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
} 