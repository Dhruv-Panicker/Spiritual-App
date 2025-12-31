import { Platform } from 'react-native';

export interface UserLoginData {
  email: string;
  name: string;
  loginTime: string;
  isAdmin: boolean;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  dateAdded: string;
  reflection?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  dateAdded: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location?: string;
  type: 'meditation' | 'teaching' | 'celebration' | 'retreat';
}

class GoogleSheetsService {
  private webhookUrl: string;
  private SHEET_ID: string;
  private API_KEY: string;
  private BASE_URL: string;

  constructor() {
    // Google Apps Script Web App URL for logging user logins
    this.webhookUrl = 'https://script.google.com/macros/s/AKfycbxnRGkIBfWhKeY1iQeSU6O3lFk89wr1jOIZRfKZwcXRldEBbif6EbBCUGRw0vFUFMet/exec';
    
    // Google Sheet ID and API key for reading quotes
    this.SHEET_ID = '1AfDkX6REafycGuXG7kRz0jDzoQgqDty3QayuIZJEPng';
    this.API_KEY = 'AIzaSyB2BKuT1V0MGR6GXtaJL73j0KDONZpW454';
    this.BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${this.SHEET_ID}/values`;
  }

  /**
   * Generic method to read data from any sheet using Google Sheets API
   */
  private async readSheet(sheetName: string, range: string = ''): Promise<any[][]> {
    try {
      const url = `${this.BASE_URL}/${sheetName}${range ? `!${range}` : ''}?key=${this.API_KEY}`;
      console.log('📖 Reading sheet:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Successfully read ${data.values?.length || 0} rows from sheet: ${sheetName}`);
      return data.values || [];
    } catch (error) {
      console.error(`❌ Error reading sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Log user login to Google Sheets via webhook
   */
  async logUserLogin(userData: UserLoginData): Promise<boolean> {
    try {
      console.log('📊 Attempting to log user login:', userData);

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

      console.log('📤 Sending to webhook:', this.webhookUrl);

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
        mode: 'no-cors' // Important for Google Apps Script
      });

      console.log('📥 Webhook response status:', response.status);

      // With no-cors mode, we can't read the response, but if no error is thrown, it likely worked
      console.log('✅ User login sent to Google Sheets webhook');
      this.logLocally(userData);
      return true;

    } catch (error) {
      console.error('❌ Error sending to Google Sheets webhook:', error);
      this.logLocally(userData);
      return false; // Don't fail login if webhook fails
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
  }

  /**
   * Get quotes from Google Sheets
   * Reads from the 'quotes' sheet in Google Sheets
   * Expected columns: [id, text, author, category, dateAdded, reflection]
   */
  async getQuotes(): Promise<Quote[]> {
    try {
      console.log('📚 Loading quotes from Google Sheets...');
      
      const rows = await this.readSheet('quotes');
      
      if (!rows.length) {
        console.log('⚠️ No quotes found in sheet (sheet is empty or does not exist)');
        return [];
      }
      
      // First row is headers, skip it
      const [headers, ...dataRows] = rows;
      console.log('📋 Sheet headers:', headers);
      console.log(`📊 Found ${dataRows.length} quote rows`);
      
      const quotes: Quote[] = dataRows.map((row, index) => {
        // Map columns: [id, text, author, category, dateAdded, reflection]
        const quote: Quote = {
          id: row[0] || `quote_${index + 1}`,
          text: row[1] || '',
          author: row[2] || 'Unknown',
          category: row[3] || 'General',
          dateAdded: row[4] || new Date().toISOString(),
          reflection: row[5] || undefined
        };
        
        // Filter out empty quotes (where text is empty)
        return quote;
      }).filter(quote => quote.text.trim().length > 0);
      
      console.log(`✅ Loaded ${quotes.length} quotes from Google Sheets`);
      return quotes;
      
    } catch (error) {
      console.error('❌ Error getting quotes from Google Sheets:', error);
      // Return empty array on error instead of throwing, so app still works
      return [];
    }
  }

  /**
   * Add a new quote to Google Sheets via webhook
   */
  async addQuote(quote: Omit<Quote, 'id' | 'dateAdded'>): Promise<Quote> {
    try {
      const newQuote: Quote = {
        id: `quote_${Date.now()}`,
        ...quote,
        dateAdded: new Date().toISOString(),
      };

      const rowData = [
        newQuote.id,
        newQuote.text,
        newQuote.author,
        newQuote.category,
        newQuote.dateAdded,
        newQuote.reflection || ''
      ];

      // Send to Google Sheets via webhook (Apps Script)
      const payload = {
        action: 'append',
        sheetName: 'quotes',
        data: rowData
      };

      console.log('📤 Sending quote to Google Sheets via webhook:', newQuote);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('✅ Quote sent to Google Sheets (no-cors mode)');
      
      return newQuote;
    } catch (error) {
      console.error('❌ Error adding quote:', error);
      throw error;
    }
  }

  /**
   * Write data to sheet via webhook (generic method)
   */
  private async writeToSheet(sheetName: string, data: any[]): Promise<any> {
    try {
      const payload = {
        action: 'append',
        sheetName: sheetName,
        data: data
      };
      
      console.log('📤 Sending to Apps Script:', this.webhookUrl);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('✅ Data sent to Google Sheets (no-cors mode)');
      return { success: true, message: 'Data sent to Google Sheets' };
    } catch (error) {
      console.error(`❌ Error writing to sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Get videos from Google Sheets
   * Reads from the 'videos' sheet in Google Sheets
   * Expected columns: [id, title, description, youtubeId, dateAdded]
   */
  async getVideos(): Promise<Video[]> {
    try {
      console.log('📺 Loading videos from Google Sheets...');
      
      const rows = await this.readSheet('videos');
      
      if (!rows.length) {
        console.log('⚠️ No videos found in sheet (sheet is empty or does not exist)');
        return [];
      }
      
      // First row is headers, skip it
      const [headers, ...dataRows] = rows;
      console.log('📋 Sheet headers:', headers);
      console.log(`📊 Found ${dataRows.length} video rows`);
      
      const videos: Video[] = dataRows.map((row, index) => {
        // Map columns: [id, title, description, youtubeId, dateAdded]
        const video: Video = {
          id: row[0] || `video_${index + 1}`,
          title: row[1] || '',
          description: row[2] || '',
          youtubeId: row[3] || '',
          dateAdded: row[4] || new Date().toISOString()
        };
        
        return video;
      }).filter(video => video.youtubeId.trim().length > 0 && video.title.trim().length > 0);
      
      console.log(`✅ Loaded ${videos.length} videos from Google Sheets`);
      return videos;
      
    } catch (error) {
      console.error('❌ Error getting videos from Google Sheets:', error);
      // Return empty array on error instead of throwing, so app still works
      return [];
    }
  }

  /**
   * Add a new video to Google Sheets via webhook
   */
  async addVideo(video: Omit<Video, 'id' | 'dateAdded'>): Promise<Video> {
    try {
      const newVideo: Video = {
        id: `video_${Date.now()}`,
        ...video,
        dateAdded: new Date().toISOString(),
      };

      const rowData = [
        newVideo.id,
        newVideo.title,
        newVideo.description,
        newVideo.youtubeId,
        newVideo.dateAdded
      ];

      // Send to Google Sheets via webhook (Apps Script)
      const payload = {
        action: 'append',
        sheetName: 'videos',
        data: rowData
      };

      console.log('📤 Sending video to Google Sheets via webhook:', newVideo);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('✅ Video sent to Google Sheets (no-cors mode)');
      
      return newVideo;
    } catch (error) {
      console.error('❌ Error adding video:', error);
      throw error;
    }
  }

  /**
   * Get events from Google Sheets
   * Reads from the 'events' sheet in Google Sheets
   * Expected columns: [id, title, date, time, description, location, type]
   */
  async getEvents(): Promise<Event[]> {
    try {
      console.log('📅 Loading events from Google Sheets...');
      
      const rows = await this.readSheet('events');
      
      if (!rows.length) {
        console.log('⚠️ No events found in sheet (sheet is empty or does not exist)');
        return [];
      }
      
      // First row is headers, skip it
      const [headers, ...dataRows] = rows;
      console.log('📋 Sheet headers:', headers);
      console.log(`📊 Found ${dataRows.length} event rows`);
      
      const events: Event[] = dataRows.map((row, index) => {
        // Map columns: [id, title, date, time, description, location, type]
        const event: Event = {
          id: row[0] || `event_${index + 1}`,
          title: row[1] || '',
          date: row[2] || '',
          time: row[3] || '',
          description: row[4] || '',
          location: row[5] || undefined,
          type: (row[6] || 'meditation') as Event['type']
        };
        
        return event;
      }).filter(event => event.title.trim().length > 0 && event.date.trim().length > 0);
      
      console.log(`✅ Loaded ${events.length} events from Google Sheets`);
      return events;
      
    } catch (error) {
      console.error('❌ Error getting events from Google Sheets:', error);
      // Return empty array on error instead of throwing, so app still works
      return [];
    }
  }

  /**
   * Add a new event to Google Sheets via webhook
   */
  async addEvent(event: Omit<Event, 'id'>): Promise<Event> {
    try {
      const newEvent: Event = {
        id: `event_${Date.now()}`,
        ...event,
      };

      const rowData = [
        newEvent.id,
        newEvent.title,
        newEvent.date,
        newEvent.time,
        newEvent.description,
        newEvent.location || '',
        newEvent.type
      ];

      // Send to Google Sheets via webhook (Apps Script)
      const payload = {
        action: 'append',
        sheetName: 'events',
        data: rowData
      };

      console.log('📤 Sending event to Google Sheets via webhook:', newEvent);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('✅ Event sent to Google Sheets (no-cors mode)');
      
      return newEvent;
    } catch (error) {
      console.error('❌ Error adding event:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;

