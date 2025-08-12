
const { googleSheetsService } = require('../services/googleSheetsService');

async function initializeSheet() {
  try {
    console.log('Initializing Google Sheet...');
    await googleSheetsService.initializeSheet();
    console.log('Google Sheet initialized successfully!');
    
    // Test logging a sample entry
    await googleSheetsService.logUserLogin({
      email: 'test@example.com',
      name: 'Test User',
      loginTime: new Date().toISOString(),
      isAdmin: false
    });
    
    console.log('Test entry added successfully!');
  } catch (error) {
    console.error('Error initializing Google Sheet:', error);
  }
}

initializeSheet();
