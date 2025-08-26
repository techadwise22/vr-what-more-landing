// Database connection using postgres package
import postgres from 'postgres';

// Database configuration
const sql = postgres(process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/database', {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
});

// Database functions
export const db = {
  // Insert basic info
  async insertBasicInfo(data) {
    try {
      const result = await sql`
        INSERT INTO basic_info (full_name, email, phone)
        VALUES (${data.fullName}, ${data.email}, ${data.phone})
        RETURNING id, full_name, email, phone, created_at
      `;
      return { success: true, data: result[0] };
    } catch (error) {
      console.error('Error inserting basic info:', error);
      return { success: false, error: error.message };
    }
  },

  // Insert professional details
  async insertProfessionalDetails(basicInfoId, data) {
    try {
      const result = await sql`
        INSERT INTO professional_details (
          basic_info_id, primary_area, other_area, experience_years,
          organization, role, values, other_values, priorities,
          other_priorities, biggest_challenge, other_challenge,
          street_address, locality, landmark, city, state, other_state,
          pin_code, birthday, skip_birthday, was_student, batch_year, institute_name
        )
        VALUES (
          ${basicInfoId}, ${data.primaryArea}, ${data.otherArea || null},
          ${data.experience}, ${data.organization}, ${data.role},
          ${data.values}, ${data.otherValues || null}, ${data.priorities},
          ${data.otherPriorities || null}, ${data.biggestChallenge},
          ${data.otherChallenge || null}, ${data.streetAddress},
          ${data.locality}, ${data.landmark || null}, ${data.city},
          ${data.state}, ${data.otherState || null}, ${data.pinCode},
          ${data.birthday || null}, ${data.skipBirthday || false},
          ${data.wasStudent}, ${data.batchYear || null}, ${data.instituteName || null}
        )
        RETURNING id, basic_info_id, created_at
      `;
      return { success: true, data: result[0] };
    } catch (error) {
      console.error('Error inserting professional details:', error);
      return { success: false, error: error.message };
    }
  },

  // Update signup count
  async updateSignupCount() {
    try {
      const result = await sql`
        INSERT INTO signup_stats (count) VALUES (1)
        ON CONFLICT (id) DO UPDATE SET 
          count = signup_stats.count + 1,
          updated_at = NOW()
        RETURNING count
      `;
      return { success: true, count: result[0].count };
    } catch (error) {
      console.error('Error updating signup count:', error);
      return { success: false, error: error.message };
    }
  },

  // Get signup count
  async getSignupCount() {
    try {
      const result = await sql`
        SELECT count FROM signup_stats ORDER BY created_at DESC LIMIT 1
      `;
      return result[0] ? result[0].count : 0;
    } catch (error) {
      console.error('Error getting signup count:', error);
      return 0;
    }
  },

  // Get all submissions
  async getAllSubmissions() {
    try {
      const result = await sql`
        SELECT 
          bi.id, bi.full_name, bi.email, bi.phone, bi.created_at,
          pd.primary_area, pd.organization, pd.role, pd.city, pd.state
        FROM basic_info bi
        LEFT JOIN professional_details pd ON bi.id = pd.basic_info_id
        ORDER BY bi.created_at DESC
      `;
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting submissions:', error);
      return { success: false, error: error.message };
    }
  },

  // Get submission by email
  async getSubmissionByEmail(email) {
    try {
      const result = await sql`
        SELECT 
          bi.id, bi.full_name, bi.email, bi.phone, bi.created_at,
          pd.*
        FROM basic_info bi
        LEFT JOIN professional_details pd ON bi.id = pd.basic_info_id
        WHERE bi.email = ${email}
      `;
      return { success: true, data: result[0] || null };
    } catch (error) {
      console.error('Error getting submission by email:', error);
      return { success: false, error: error.message };
    }
  },

  // Close database connection
  async close() {
    await sql.end();
  }
};

export default sql; 