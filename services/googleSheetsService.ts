import { Platform } from 'react-native';

interface UserLoginData {
  email: string;
  name: string;
  loginTime: string;
  isAdmin: boolean;
}

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  dateAdded: string;
  reflection?: string;
}

interface Video {
  id: string;
  title: string;  
  description: string;
  youtubeId: string;
  dateAdded: string;
}

interface User {
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: string;
}

class GoogleSheetsService {
  private webhookUrl: string;
  private SHEET_ID: string;
  private API_KEY: string;
  private BASE_URL: string;

  constructor() {
    // Your UPDATED Google Apps Script Web App URL (latest deployment!)
    this.webhookUrl = 'https://script.google.com/macros/s/AKfycbxnRGkIBfWhKeY1iQeSU6O3lFk89wr1jOIZRfKZwcXRldEBbif6EbBCUGRw0vFUFMet/exec';
    
    // Your existing Google Sheet ID and API key
    this.SHEET_ID = '1AfDkX6REafycGuXG7kRz0jDzoQgqDty3QayuIZJEPng';
    this.API_KEY = 'AIzaSyB2BKuT1V0MGR6GXtaJL73j0KDONZpW454';
    this.BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${this.SHEET_ID}/values`;
  }

  // Generic method to read data from any sheet
  async readSheet(sheetName: string, range: string = ''): Promise<any[][]> {
    try {
      const url = `${this.BASE_URL}/${sheetName}${range ? `!${range}` : ''}?key=${this.API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error(`Error reading sheet ${sheetName}:`, error);
      throw error;
    }
  }

  // Generic method to write data to sheet (requires Apps Script)
  async writeToSheet(sheetName: string, data: any[]): Promise<any> {
    try {
      const payload = {
        action: 'append',
        sheetName: sheetName,
        data: data
      };
      
      console.log('📤 Sending to Apps Script:', this.webhookUrl);
      console.log('📋 Payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script - same as login
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 Response received (no-cors mode)');
      
      // With no-cors mode, we can't read the response details
      // If no error is thrown, the request likely succeeded
      console.log('✅ Data sent to Google Sheets (no-cors mode)');
      return { success: true, message: 'Data sent to Google Sheets' };
    } catch (error) {
      console.error(`❌ Error writing to sheet ${sheetName}:`, error);
      throw error;
    }
  }

  // USER METHODS
  async getUsers(): Promise<User[]> {
    try {
      const rows = await this.readSheet('users');
      if (!rows.length) return [];
      
      const [headers, ...dataRows] = rows;
      return dataRows.map(row => ({
        email: row[0] || '',
        password: row[1] || '',
        isAdmin: row[2] === 'TRUE' || row[2] === 'true',
        createdAt: row[3] || ''
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async findUser(email: string, password: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.password === password
      ) || null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  // QUOTES METHODS
  async getQuotes(): Promise<Quote[]> {
    try {
      const rows = await this.readSheet('quotes');
      if (!rows.length) return [];
      
      const [headers, ...dataRows] = rows;
      return dataRows.map((row, index) => ({
        id: row[0] || `quote_${index + 1}`,
        text: row[1] || '',
        author: row[2] || 'Unknown',
        category: row[3] || 'General',
        dateAdded: row[4] || new Date().toISOString(),
        reflection: row[5] || undefined
      }));
    } catch (error) {
      console.error('Error getting quotes:', error);
      return [];
    }
  }

  async addQuote(quote: Omit<Quote, 'id' | 'dateAdded'>): Promise<Quote> {
    console.log('🚀 GoogleSheetsService.addQuote() called with:', quote);
    
    try {
      const newQuote: Quote = {
        id: `quote_${Date.now()}`,
        text: quote.text,
        author: quote.author || 'Unknown',
        category: quote.category || 'General',
        dateAdded: new Date().toISOString(),
        reflection: quote.reflection
      };

      const rowData = [
        newQuote.id,
        newQuote.text,
        newQuote.author,
        newQuote.category,
        newQuote.dateAdded,
        newQuote.reflection || ''
      ];

      console.log('🔄 Adding quote to Google Sheets:', newQuote);
      console.log('📤 Sending data:', { action: 'append', sheetName: 'quotes', data: rowData });
      console.log('🌐 Webhook URL:', this.webhookUrl);
      
      const result = await this.writeToSheet('quotes', rowData);
      console.log('✅ Quote added successfully:', result);
      
      return newQuote;
    } catch (error) {
      console.error('❌ Error in addQuote:', error);
      console.error('❌ Error stack:', (error as Error).stack);
      throw error;
    }
  }

  async removeQuote(id: string): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          sheetName: 'quotes',
          id: id
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error removing quote:', error);
      return false;
    }
  }

  async updateQuote(id: string, updatedData: Partial<Quote>): Promise<Quote | null> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          sheetName: 'quotes',
          id: id,
          data: updatedData
        })
      });
      
      if (response.ok) {
        return { id, ...updatedData } as Quote;
      }
      return null;
    } catch (error) {
      console.error('Error updating quote:', error);
      return null;
    }
  }

  // VIDEOS METHODS  
  async getVideos(): Promise<Video[]> {
    try {
      const rows = await this.readSheet('videos');
      if (!rows.length) return [];
      
      const [headers, ...dataRows] = rows;
      return dataRows.map((row, index) => ({
        id: row[0] || `video_${index + 1}`,
        title: row[1] || '',
        description: row[2] || '',
        youtubeId: row[3] || '',
        dateAdded: row[4] || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting videos:', error);
      return [];
    }
  }

  async addVideo(video: Omit<Video, 'id' | 'dateAdded'>): Promise<Video> {
    try {
      const newVideo: Video = {
        id: `video_${Date.now()}`,
        title: video.title,
        description: video.description || '',
        youtubeId: video.youtubeId,
        dateAdded: new Date().toISOString()
      };

      const rowData = [
        newVideo.id,
        newVideo.title,
        newVideo.description,
        newVideo.youtubeId,
        newVideo.dateAdded
      ];

      await this.writeToSheet('videos', rowData);
      return newVideo;
    } catch (error) {
      console.error('Error adding video:', error);
      throw error;
    }
  }

  async removeVideo(id: string): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          sheetName: 'videos',
          id: id
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error removing video:', error);
      return false;
    }
  }

  async updateVideo(id: string, updatedData: Partial<Video>): Promise<Video | null> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          sheetName: 'videos',
          id: id,
          data: updatedData
        })
      });
      
      if (response.ok) {
        return { id, ...updatedData } as Video;
      }
      return null;
    } catch (error) {
      console.error('Error updating video:', error);
      return null;
    }
  }

  // INITIALIZATION - Add sample data if sheets are empty
  async initializeWithSampleData(): Promise<void> {
    try {
      console.log('🔄 Initializing Google Sheets with sample data...');
      
      // Check if quotes sheet has data
      const existingQuotes = await this.getQuotes();
      if (existingQuotes.length === 0) {
        console.log('📝 Adding sample quotes...');
        const sampleQuotes = [
          {
            text: "The mind is everything. What you think you become.",
            author: "Buddha",
            category: "Wisdom",
            reflection: "What thoughts are shaping your reality today? How can you choose more positive, empowering thoughts?"
          },
          {
            text: "Peace comes from within. Do not seek it without.",
            author: "Buddha", 
            category: "Peace",
            reflection: "Where are you looking for peace in your life? How can you cultivate inner tranquility instead of seeking it externally?"
          },
          {
            text: "Three things cannot be long hidden: the sun, the moon, and the truth.",
            author: "Buddha",
            category: "Truth",
            reflection: "What truth in your life are you avoiding or hiding from? How might embracing this truth bring you freedom?"
          }
        ];

        for (const quote of sampleQuotes) {
          await this.addQuote(quote);
        }
      }

      // Check if videos sheet has data  
      const existingVideos = await this.getVideos();
      if (existingVideos.length === 0) {
        console.log('📺 Adding sample videos...');
        const sampleVideos = [
          {
            title: "10 Minute Guided Meditation for Beginners",
            description: "A peaceful meditation session perfect for those starting their mindfulness journey.",
            youtubeId: "ZToicYcHIOU"
          },
          {
            title: "Morning Spiritual Practice",
            description: "Start your day with this uplifting spiritual practice and meditation.",
            youtubeId: "inpok4MKVLM"
          }
        ];

        for (const video of sampleVideos) {
          await this.addVideo(video);
        }
      }
      
      console.log('✅ Google Sheets initialization complete');
    } catch (error) {
      console.error('Error initializing Google Sheets:', error);
    }
  }

  // LEGACY METHOD - Keep for existing login functionality
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