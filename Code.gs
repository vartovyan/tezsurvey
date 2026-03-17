/**
 * Google Apps Script — Backend for Psychology Research Survey
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this entire code into Code.gs
 * 3. Create a Google Sheet and copy its ID from the URL
 *    (the long string between /d/ and /edit in the sheet URL)
 * 4. Replace SPREADSHEET_ID below with your Sheet ID
 * 5. Deploy: Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the web app URL and paste it into script.js as SCRIPT_URL
 */

// ============================================
// CONFIGURATION
// ============================================
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Yanıtlar'; // Name of the sheet tab

// ============================================
// COLUMN HEADERS (fixed order)
// ============================================
const HEADERS = [
  'timestamp',
  'email',
  'consent',
  'age',
  'gender',
  'education',
  'relationship_status',
  'relationship_type',
  'relationship_duration',
  'caregivers',
  'caregivers_other',
  'parents_marital',
  'parents_marital_other',
  'family_structure',
  'family_structure_other',
  // Scale 1: Codependency (25 items)
  's1_q1', 's1_q2', 's1_q3', 's1_q4', 's1_q5',
  's1_q6', 's1_q7', 's1_q8', 's1_q9', 's1_q10',
  's1_q11', 's1_q12', 's1_q13', 's1_q14', 's1_q15',
  's1_q16', 's1_q17', 's1_q18', 's1_q19', 's1_q20',
  's1_q21', 's1_q22', 's1_q23', 's1_q24', 's1_q25',
  // Scale 2: ECR-R / YİYE-II (36 items)
  's2_q1', 's2_q2', 's2_q3', 's2_q4', 's2_q5',
  's2_q6', 's2_q7', 's2_q8', 's2_q9', 's2_q10',
  's2_q11', 's2_q12', 's2_q13', 's2_q14', 's2_q15',
  's2_q16', 's2_q17', 's2_q18', 's2_q19', 's2_q20',
  's2_q21', 's2_q22', 's2_q23', 's2_q24', 's2_q25',
  's2_q26', 's2_q27', 's2_q28', 's2_q29', 's2_q30',
  's2_q31', 's2_q32', 's2_q33', 's2_q34', 's2_q35', 's2_q36',
  // Scale 3: Positive Childhood Experiences (7 items)
  's3_q1', 's3_q2', 's3_q3', 's3_q4', 's3_q5', 's3_q6', 's3_q7'
];

// ============================================
// doPost — Handles incoming form submissions
// ============================================
function doPost(e) {
  try {
    // Parse the JSON body (sent as text/plain from the frontend)
    const data = JSON.parse(e.postData.contents);
    
    // Open the spreadsheet and get/create the sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      // Bold the header row
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      // Freeze the header row
      sheet.setFrozenRows(1);
    }
    
    // If the sheet is empty (no headers), add them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // Build the row in the correct column order
    const row = HEADERS.map(header => {
      if (header === 'timestamp') {
        // Use the client timestamp or generate server-side
        return data.timestamp || new Date().toISOString();
      }
      return data[header] !== undefined ? data[header] : '';
    });
    
    // Append the row
    sheet.appendRow(row);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error for debugging
    console.error('doPost error:', error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// doGet — Simple health check
// ============================================
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Survey API is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// setupSheet — Run once to initialize headers
// ============================================
function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Clear and set headers
  sheet.clear();
  sheet.appendRow(HEADERS);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  for (let i = 1; i <= HEADERS.length; i++) {
    sheet.autoResizeColumn(i);
  }
  
  Logger.log('Sheet setup complete with ' + HEADERS.length + ' columns.');
}
