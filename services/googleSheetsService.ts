
import { Platform } from 'react-native';

interface UserLoginData {
  email: string;
  name: string;
  loginTime: string;
  isAdmin: boolean;
}

class GoogleSheetsService {
  private apiKey: string;
  private spreadsheetId: string;

  constructor() {
    // For React Native, we'll use REST API instead of googleapis library
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';
    this.apiKey = process.env.GOOGLE_API_KEY || ''; // You'll need to add this
  }

  private getAccessToken(): string {
    // For React Native, we need to handle authentication differently
    // This is a simplified version - in production, you'd use proper OAuth flow
    return process.env.GOOGLE_ACCESS_TOKEN || '';
  }

  async logUserLogin(userData: UserLoginData): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // For web platform, we can still use the REST API
        return await this.logUserLoginWeb(userData);
      } else {
        // For native platforms, use REST API
        return await this.logUserLoginNative(userData);
      }
    } catch (error) {
      console.error('Error logging to Google Sheets:', error);
      return false;
    }
  }

  private async logUserLoginWeb(userData: UserLoginData): Promise<boolean> {
    try {
      const values = [
        [
          userData.email,
          userData.name,
          userData.loginTime,
          userData.isAdmin ? 'Yes' : 'No'
        ]
      ];

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sheet1:append?valueInputOption=RAW&key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({
          values: values
        })
      });

      if (response.ok) {
        console.log('User login logged to Google Sheets successfully');
        return true;
      } else {
        console.error('Failed to log to Google Sheets:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error in logUserLoginWeb:', error);
      return false;
    }
  }

  private async logUserLoginNative(userData: UserLoginData): Promise<boolean> {
    try {
      // For now, we'll log locally and sync later, or use a simpler approach
      console.log('Would log to Google Sheets:', userData);
      
      // You could implement a queue system here to sync data when network is available
      // or use a webhook/cloud function approach
      
      return true;
    } catch (error) {
      console.error('Error in logUserLoginNative:', error);
      return false;
    }
  }

  async initializeSheet(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await this.initializeSheetWeb();
      } else {
        console.log('Sheet initialization skipped for native platform');
      }
    } catch (error) {
      console.error('Error initializing sheet:', error);
    }
  }

  private async initializeSheetWeb(): Promise<void> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sheet1!A1:D1?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      });

      const data = await response.json();

      if (!data.values || data.values.length === 0) {
        // Add headers
        const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sheet1!A1:D1?valueInputOption=RAW&key=${this.apiKey}`;
        
        await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAccessToken()}`
          },
          body: JSON.stringify({
            values: [['Email', 'Name', 'Login Time', 'Is Admin']]
          })
        });

        console.log('Sheet headers initialized');
      }
    } catch (error) {
      console.error('Error initializing sheet:', error);
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
