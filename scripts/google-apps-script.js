
// Google Apps Script code to handle webhook requests
// Deploy this as a web app in Google Apps Script

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'logUserLogin') {
      return logUserLogin(data.data || data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: 'Unknown action'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function logUserLogin(userData) {
  try {
    // Replace with your actual Google Sheet ID
    const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Check if headers exist
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Email', 'Name', 'Login Time', 'Is Admin', 'Platform']);
    }
    
    // Add the user login data
    sheet.appendRow([
      userData.email || 'N/A',
      userData.name || 'N/A', 
      userData.loginTime || new Date().toISOString(),
      userData.isAdmin ? 'Yes' : 'No',
      userData.platform || 'unknown'
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Google Sheets Logger is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
