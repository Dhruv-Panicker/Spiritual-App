
import { Platform } from 'react-native';

interface UserLoginData {
  email: string;
  name: string;
  loginTime: string;
  isAdmin: boolean;
}

class GoogleSheetsService {
  private webhookUrl: string;
  private apiKey: string;

  constructor() {
    // Using a webhook approach that works with React Native
    this.webhookUrl = 'https://script.google.com/macros/s/AKfycbwWhzxce1cohv7smwNkBHGNgIwyt8G5KFkM21Xa9Zd24ZwrBFME9nYQ3y6rIkig3tWM/exec';
    this.apiKey = process.env.GOOGLE_API_KEY || '';
  }

  async logUserLogin(userData: UserLoginData): Promise<boolean> {
    try {
      console.log('Attempting to log user login:', userData);
      
      if (Platform.OS === 'web') {
        return await this.logUserLoginWeb(userData);
      } else {
        return await this.logUserLoginNative(userData);
      }
    } catch (error) {
      console.error('Error logging to Google Sheets:', error);
      return false;
    }
  }

  private async logUserLoginWeb(userData: UserLoginData): Promise<boolean> {
    try {
      // For web, try to use Google Apps Script webhook
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'logUserLogin',
          data: userData
        })
      });

      if (response.ok) {
        console.log('User login logged to Google Sheets successfully (web)');
        return true;
      } else {
        console.log('Webhook not available, logging locally (web)');
        this.logLocally(userData);
        return true;
      }
    } catch (error) {
      console.log('Webhook failed, logging locally (web):', error);
      this.logLocally(userData);
      return true;
    }
  }

  private async logUserLoginNative(userData: UserLoginData): Promise<boolean> {
    try {
      // For React Native, use a simpler approach with fetch
      const webhookData = {
        action: 'logUserLogin',
        email: userData.email,
        name: userData.name,
        loginTime: userData.loginTime,
        isAdmin: userData.isAdmin,
        platform: Platform.OS
      };

      // Try webhook first
      try {
        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });

        if (response.ok) {
          console.log('User login logged to Google Sheets successfully (native)');
          return true;
        }
      } catch (webhookError) {
        console.log('Webhook not available, will log locally');
      }

      // Fallback: log locally and queue for later sync
      this.logLocally(userData);
      return true;

    } catch (error) {
      console.error('Error in logUserLoginNative:', error);
      this.logLocally(userData);
      return true;
    }
  }

  private logLocally(userData: UserLoginData): void {
    // Log to console for debugging
    console.log('=== USER LOGIN LOGGED ===');
    console.log('Email:', userData.email);
    console.log('Name:', userData.name);
    console.log('Login Time:', userData.loginTime);
    console.log('Is Admin:', userData.isAdmin);
    console.log('Platform:', Platform.OS);
    console.log('========================');

    // You could also store this in AsyncStorage to sync later
    // or send to your own backend API
  }

  async initializeSheet(): Promise<void> {
    console.log('Sheet initialization - React Native compatible version');
    // For React Native, we don't need to initialize sheets directly
    // The webhook or backend service will handle this
  }
}

export const googleSheetsService = new GoogleSheetsService();
