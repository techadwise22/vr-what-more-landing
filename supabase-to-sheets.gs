// Supabase to Google Sheets Integration Script
// Copy this code to Google Apps Script: https://script.google.com/

// Your Supabase credentials
const SUPABASE_URL = 'https://qyrroegdckqpquglsuru.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cnJvZWdkY2txcHF1Z2xzdXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDEzNTUsImV4cCI6MjA3MTgxNzM1NX0.NTSqSELIjJF1OSVO9IcjCA3tpzfFix7uMppvDeNejcc';

// Main sync function
function syncSupabaseToSheets() {
  try {
    console.log('Starting Supabase to Google Sheets sync...');
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Create or get sheets for each table
    const basicInfoSheet = getOrCreateSheet(spreadsheet, 'Basic Info');
    const professionalDetailsSheet = getOrCreateSheet(spreadsheet, 'Professional Details');
    const signupStatsSheet = getOrCreateSheet(spreadsheet, 'Signup Stats');
    
    // Sync each table
    syncBasicInfo(basicInfoSheet);
    syncProfessionalDetails(professionalDetailsSheet);
    syncSignupStats(signupStatsSheet);
    
    console.log('✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during sync:', error.toString());
  }
}

// Get or create a sheet
function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    console.log(`Created new sheet: ${sheetName}`);
  }
  return sheet;
}

// Sync basic_info table
function syncBasicInfo(sheet) {
  console.log('Syncing basic_info table...');
  
  // Clear existing data (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear();
  }
  
  // Set headers
  const headers = ['ID', 'Full Name', 'Email', 'Phone', 'LinkedIn URL', 'Created At', 'Updated At'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Fetch data from Supabase
  const url = `${SUPABASE_URL}/rest/v1/basic_info?select=*&order=created_at.desc`;
  const response = UrlFetchApp.fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  
  const data = JSON.parse(response.getContentText());
  console.log(`Found ${data.length} basic_info records`);
  
  if (data && data.length > 0) {
    const rows = data.map(row => [
      row.id,
      row.full_name,
      row.email,
      row.phone,
      row.linkedin_url || '',
      new Date(row.created_at),
      new Date(row.updated_at)
    ]);
    
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

// Sync professional_details table
function syncProfessionalDetails(sheet) {
  console.log('Syncing professional_details table...');
  
  // Clear existing data (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear();
  }
  
  // Set headers
  const headers = [
    'ID', 'Email', 'Primary Area', 'Other Primary Area', 'Experience', 
    'Organization', 'Role', 'Values', 'Priorities', 'Biggest Challenge',
    'Street Address', 'Locality', 'Landmark', 'City', 'State', 'Pin Code',
    'Birthday', 'Skip Birthday', 'Was Student', 'Batch Year', 'Institute Name',
    'Captcha Token', 'Captcha Verified', 'Honeypot Website', 'Created At', 'Updated At'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Fetch data from Supabase
  const url = `${SUPABASE_URL}/rest/v1/professional_details?select=*&order=created_at.desc`;
  const response = UrlFetchApp.fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  
  const data = JSON.parse(response.getContentText());
  console.log(`Found ${data.length} professional_details records`);
  
  if (data && data.length > 0) {
    const rows = data.map(row => [
      row.id,
      row.email,
      row.primary_area,
      row.other_primary_area || '',
      row.experience,
      row.organization || '',
      row.role || '',
      row.values || '',
      row.priorities || '',
      row.biggest_challenge || '',
      row.street_address,
      row.locality,
      row.landmark || '',
      row.city,
      row.state,
      row.pin_code,
      row.birthday ? new Date(row.birthday) : '',
      row.skip_birthday,
      row.was_student,
      row.batch_year || '',
      row.institute_name || '',
      row.captcha_token || '',
      row.captcha_verified,
      row.honeypot_website || '',
      new Date(row.created_at),
      new Date(row.updated_at)
    ]);
    
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

// Sync signup_stats table
function syncSignupStats(sheet) {
  console.log('Syncing signup_stats table...');
  
  // Clear existing data (keep headers)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear();
  }
  
  // Set headers
  const headers = ['ID', 'Count', 'Created At', 'Updated At'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Fetch data from Supabase
  const url = `${SUPABASE_URL}/rest/v1/signup_stats?select=*&order=created_at.desc`;
  const response = UrlFetchApp.fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  
  const data = JSON.parse(response.getContentText());
  console.log(`Found ${data.length} signup_stats records`);
  
  if (data && data.length > 0) {
    const rows = data.map(row => [
      row.id,
      row.count,
      new Date(row.created_at),
      new Date(row.updated_at)
    ]);
    
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

// Function to set up automatic sync (runs every hour)
function setupAutomaticSync() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncSupabaseToSheets') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger to run every hour
  ScriptApp.newTrigger('syncSupabaseToSheets')
    .timeBased()
    .everyHours(1)
    .create();
    
  console.log('✅ Automatic sync set up to run every hour');
}

// Function to manually trigger sync
function manualSync() {
  console.log('🔄 Starting manual sync...');
  syncSupabaseToSheets();
}

// Function to test connection
function testConnection() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/basic_info?select=count`;
    const response = UrlFetchApp.fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    console.log('✅ Connection to Supabase successful!');
    console.log('Response status:', response.getResponseCode());
    
  } catch (error) {
    console.error('❌ Connection failed:', error.toString());
  }
} 