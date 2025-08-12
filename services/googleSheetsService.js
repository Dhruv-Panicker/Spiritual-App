
const { google } = require('googleapis');

class GoogleSheetsService {
  constructor() {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: this.getCredentials(),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';
  }

  getCredentials() {
    try {
      // Parse credentials from environment variable
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
      return credentials;
    } catch (error) {
      console.error('Error parsing Google credentials:', error);
      return {};
    }
  }

  async logUserLogin(userData) {
    try {
      const values = [
        [
          userData.email,
          userData.name,
          userData.loginTime,
          userData.isAdmin ? 'Yes' : 'No'
        ]
      ];

      const resource = {
        values,
      };

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:D', // Adjust range as needed
        valueInputOption: 'RAW',
        resource,
      });

      console.log('User login logged to Google Sheets successfully');
      return true;
    } catch (error) {
      console.error('Error logging to Google Sheets:', error);
      return false;
    }
  }

  async initializeSheet() {
    try {
      // Check if headers exist, if not add them
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A1:D1',
      });

      if (!response.data.values || response.data.values.length === 0) {
        // Add headers
        const headerValues = [['Email', 'Name', 'Login Time', 'Is Admin']];
        
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Sheet1!A1:D1',
          valueInputOption: 'RAW',
          resource: { values: headerValues },
        });

        console.log('Sheet headers initialized');
      }
    } catch (error) {
      console.error('Error initializing sheet:', error);
    }
  }
}

const googleSheetsService = new GoogleSheetsService();
module.exports = { googleSheetsService };
