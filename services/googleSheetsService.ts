import { Platform } from 'react-native';

interface UserLoginData {
  email: string;
  name: string;
  loginTime: string;
  isAdmin: boolean;
}

class GoogleSheetsService {
  private webhookUrl: string;

  constructor() {
    // Your actual Google Apps Script Web App URL
    this.webhookUrl = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLiIaKh9qZNg_ie75cNdR_U-aeMKKRur6wJnOwCQe943-vCclnWzraEwSOznDMpwu2HA8RFAx7S2arpgDlEKIBYA6zZbMd_9Yzzt8SHFDNjyc6vQ6ViZwIbCaaJv4KKE3cGZ5zeHOQCBeR-sdTjNeSkoHt1DMrbFalTjmjkUn4G8IBTthMIcB6ToNOfZYZC5v0bATo-eKjgfYoz-kZd3fQoNTbNxJ0f1z7NU9ERLJPif8WPaKJnSDhy3c-pdEFhKzToO2suKUhX-svnMSvDQKknGfdCpIA&lib=MmQ1L22tbLzunDtfzK6_S4RCfFGFyyfyN';
  }

  async logUserLogin(userData: UserLoginData): Promise<boolean> {
    try {
      console.log('Attempting to log user login:', userData);

      // Prepare the data for the webhook
      const webhookData = {
        action: 'logUserLogin',
        data: {
          email: userData.email,
          name: userData.name,
          loginTime: userData.loginTime,
          isAdmin: userData.isAdmin,
          platform: Platform.OS
        }
      };

      console.log('Sending to webhook:', this.webhookUrl);

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
        mode: 'no-cors' // Important for Google Apps Script
      });

      console.log('Webhook response status:', response.status);

      // With no-cors mode, we can't read the response, but if no error is thrown, it likely worked
      console.log('User login sent to Google Sheets webhook');
      this.logLocally(userData);
      return true;

    } catch (error) {
      console.error('Error sending to Google Sheets webhook:', error);
      this.logLocally(userData);
      return false;
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
    console.log('Webhook URL:', this.webhookUrl);
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