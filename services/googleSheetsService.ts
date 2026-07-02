import { Platform } from 'react-native';
import { env } from '@/config/env';

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
  imageUrl?: string;
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
  link?: string;
}

export interface PushToken {
  email: string;
  pushToken: string;
  platform: string;
  lastUpdated: string;
}

export interface LiveStatus {
  isLive: boolean;
  liveVideoId: string | null;
  channelUrl: string;
  liveTitle: string | null;
}

export interface PrayerSubmissionData {
  name: string;
  dateOfBirth: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  prayer: string;
  hasPhoto: boolean;
  /** Base64-encoded image for email attachment (when user added a photo) */
  photoBase64?: string | null;
  photoMimeType?: string;
}

class GoogleSheetsService {
  private webhookUrl: string;
  private SHEET_ID: string;
  private API_KEY: string;
  private BASE_URL: string;

  constructor() {
    // Load configuration from environment variables
    this.webhookUrl = env.googleAppsScriptWebhookUrl;
    this.SHEET_ID = env.googleSheetId;
    this.API_KEY = env.googleSheetsApiKey;
    this.BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${this.SHEET_ID}/values`;
    
    // Validate that required config is present
    if (!this.webhookUrl || !this.SHEET_ID || !this.API_KEY) {
      console.error('Missing required Google Sheets configuration. Please check your environment variables.');
    }
  }

  /**
   * Generic method to read data from any sheet using Google Sheets API
   */
  private async readSheet(sheetName: string, range: string = ''): Promise<any[][]> {
    try {
      const url = `${this.BASE_URL}/${sheetName}${range ? `!${range}` : ''}?key=${this.API_KEY}`;
      if (__DEV__) {
        console.log(`Reading sheet via API: ${sheetName}${range ? ` (${range})` : ''}`);
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        await response.text(); // consume body without logging (may contain sensitive data)
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Successfully read ${data.values?.length || 0} rows from sheet: ${sheetName}`);
      return data.values || [];
    } catch (error) {
      console.error(`Error reading sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Log user login to Google Sheets via webhook
   */
  async logUserLogin(userData: UserLoginData): Promise<boolean> {
    try {
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

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
        mode: 'no-cors' // Important for Google Apps Script
      });

      if (__DEV__) {
        console.log('User login sent to Google Sheets webhook');
      }

      return true;

    } catch (error) {
      console.error('Error sending to Google Sheets webhook:', error);
      return false; // Don't fail login if webhook fails
    }
  }

  /**
   * Get quotes from Google Sheets
   * Reads from the 'quotes' sheet in Google Sheets
   * Expected columns: [id, text, author, category, dateAdded, imageUrl]
   */
  async getQuotes(): Promise<Quote[]> {
    try {
      console.log('Loading quotes from Google Sheets...');
      
      const rows = await this.readSheet('quotes');
      
      if (!rows.length) {
        console.log('No quotes found in sheet (sheet is empty or does not exist)');
        return [];
      }
      
      // First row is headers, skip it
      const [, ...dataRows] = rows;
      console.log(`Found ${dataRows.length} quote rows`);
      
      const quotes: Quote[] = dataRows.map((row, index) => {
        // Map columns: [id, text, author, category, dateAdded, imageUrl]
        const quote: Quote = {
          id: row[0] || `quote_${index + 1}`,
          text: row[1] || '',
          author: row[2] || 'Unknown',
          category: row[3] || 'General',
          dateAdded: row[4] || new Date().toISOString(),
          imageUrl: (row[5] || '').trim().startsWith('http') ? (row[5] as string).trim() : undefined,
        };

        return quote;
      }).filter(quote => quote.text.trim().length > 0 || !!quote.imageUrl);
      
      console.log(`Loaded ${quotes.length} quotes from Google Sheets`);
      return quotes;
      
    } catch (error) {
      console.error('Error getting quotes from Google Sheets:', error);
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
        newQuote.imageUrl || '',
      ];

      // Send to Google Sheets via webhook (Apps Script)
      const payload = {
        action: 'append',
        sheetName: 'quotes',
        data: rowData
      };

      if (__DEV__) {
        console.log('Sending quote to Google Sheets via webhook', newQuote.id);
      }
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Quote sent to Google Sheets (no-cors mode)');
      
      return newQuote;
    } catch (error) {
      console.error('Error adding quote:', error);
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
      
      if (__DEV__) {
        console.log('Sending append to Apps Script webhook');
      }
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Data sent to Google Sheets (no-cors mode)');
      return { success: true, message: 'Data sent to Google Sheets' };
    } catch (error) {
      console.error(`Error writing to sheet ${sheetName}:`, error);
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
      console.log('Loading videos from Google Sheets...');
      
      const rows = await this.readSheet('videos');
      
      if (!rows.length) {
        console.log('No videos found in sheet (sheet is empty or does not exist)');
        return [];
      }
      
      // First row is headers, skip it
      const [, ...dataRows] = rows;
      console.log(`Found ${dataRows.length} video rows`);
      
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
      
      console.log(`Loaded ${videos.length} videos from Google Sheets`);
      return videos;
      
    } catch (error) {
      console.error('Error getting videos from Google Sheets:', error);
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

      if (__DEV__) {
        console.log('Sending video to Google Sheets via webhook', newVideo.id);
      }
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Video sent to Google Sheets (no-cors mode)');
      
      return newVideo;
    } catch (error) {
      console.error('Error adding video:', error);
      throw error;
    }
  }

  /**
   * Get events from Google Sheets
   * Reads from the 'events' sheet
   * Expected columns: [id, title, date, time, description, location, type, link]
   */
  async getEvents(): Promise<Event[]> {
    try {
      console.log('Loading events from Google Sheets...');
      
      const rows = await this.readSheet('events');
      
      if (!rows.length) {
        console.log('No events found in sheet (sheet is empty or does not exist)');
        return [];
      }
      
      // If first row looks like a header (id/title etc.), skip it; otherwise use all rows as data
      const firstCell = (rows[0][0] != null && rows[0][0] !== '') ? String(rows[0][0]).trim().toLowerCase() : '';
      const isHeaderRow = firstCell === 'id' || firstCell === 'title' || firstCell === 'event id' || firstCell === '' || /^[a-z\s]+$/.test(firstCell) && !firstCell.startsWith('event_');
      const dataRows = isHeaderRow ? rows.slice(1) : rows;
      
      console.log('First row treated as', isHeaderRow ? 'header (skipped)' : 'data');
      console.log(`Found ${dataRows.length} event rows`);
      
      const events: Event[] = dataRows.map((row, index) => {
        const rawType = (row[6] != null && row[6] !== '') ? String(row[6]).trim().toLowerCase() : 'meditation';
        const validTypes: Event['type'][] = ['meditation', 'teaching', 'celebration', 'retreat'];
        const type: Event['type'] = validTypes.includes(rawType as Event['type']) ? (rawType as Event['type']) : 'meditation';
        return {
          id: (row[0] != null && row[0] !== '') ? String(row[0]).trim() : `event_${index + 1}`,
          title: (row[1] != null && row[1] !== '') ? String(row[1]).trim() : '',
          date: (row[2] != null && row[2] !== '') ? String(row[2]).trim() : '',
          time: (row[3] != null && row[3] !== '') ? String(row[3]).trim() : '',
          description: (row[4] != null && row[4] !== '') ? String(row[4]).trim() : '',
          location: (row[5] != null && row[5] !== '') ? String(row[5]).trim() : undefined,
          type,
          link: (row[7] != null && row[7] !== '') ? String(row[7]).trim() : undefined,
        };
      }).filter(event => event.title.length > 0 && event.date.length > 0);
      
      console.log(`Loaded ${events.length} events from Google Sheets`);
      return events;
      
    } catch (error) {
      console.error('Error getting events from Google Sheets:', error);
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
        newEvent.type,
        newEvent.link || '',
      ];

      // Send to Google Sheets via webhook (Apps Script)
      const payload = {
        action: 'append',
        sheetName: 'events',
        data: rowData
      };

      if (__DEV__) {
        console.log('Sending event to Google Sheets via webhook', newEvent.id);
      }
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Event sent to Google Sheets (no-cors mode)');
      
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  /**
   * Save or update user's push token in Google Sheets
   * This is called when user logs in
   */
  async savePushToken(email: string, pushToken: string): Promise<boolean> {
    try {
      if (!email || !pushToken) {
        console.error('Cannot save push token: email or token is missing', {
          hasEmail: !!email,
          hasToken: !!pushToken,
        });
        return false;
      }

      const payload = {
        action: 'savePushToken',
        data: {
          email: email,
          pushToken: pushToken,
          platform: Platform.OS,
          lastUpdated: new Date().toISOString()
        }
      };


      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      return true;
    } catch (error) {
      console.error('Error saving push token:', error);
      return false;
    }
  }

  /**
   * Get all push tokens from Google Sheets
   * This is called when admin wants to send notifications to all users
   */
  async getPushTokens(): Promise<string[]> {
    try {
      console.log('Loading push tokens from Google Sheets...');

      const rows = await this.readSheet('pushTokens');

      if (!rows.length || rows.length === 0) {
        console.log('No push tokens found in sheet');
        return [];
      }

      // First row is headers, skip it
      const [, ...dataRows] = rows;

      // Extract push tokens (assuming format: [email, pushToken, platform, lastUpdated])
      const tokens = dataRows
        .map((row) => row[1]) // pushToken is in column 2 (index 1)
        .filter((token) => token && token.trim().length > 0);

      console.log(`Loaded ${tokens.length} push tokens from Google Sheets`);
      return tokens;
    } catch (error) {
      console.error('Error getting push tokens:', error);
      // If sheet doesn't exist, return empty array
      return [];
    }
  }

  /**
   * Submit a prayer: sends data to Apps Script which emails the prayer to the recipient
   * and sends a confirmation email to the user. Returns { success: true } or throws.
   */
  async submitPrayer(data: PrayerSubmissionData, recipientEmail: string): Promise<{ success: true }> {
    const payload: Record<string, unknown> = {
      action: 'submitPrayer',
      data: {
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        city: data.city,
        country: data.country,
        phone: data.phone,
        email: data.email,
        prayer: data.prayer,
        hasPhoto: data.hasPhoto,
      },
      recipientEmail,
    };
    if (data.photoBase64) {
      (payload.data as Record<string, unknown>).photoBase64 = data.photoBase64;
      (payload.data as Record<string, unknown>).photoMimeType = data.photoMimeType || 'image/jpeg';
    }

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error('Prayer submission HTTP error:', response.status);
      throw new Error(text || `Request failed (${response.status})`);
    }

    let json: { success?: boolean; error?: string };
    try {
      json = JSON.parse(text);
    } catch {
      console.error('Prayer submission: invalid JSON response');
      throw new Error('Invalid response from server');
    }

    if (json.success !== true) {
      const msg = json.error || 'Prayer submission failed';
      throw new Error(msg);
    }

    return { success: true };
  }

  /**
   * Add a verified user to the userbase sheet. Called after 2FA sign-up.
   * Webhook appends row: [user email, user name, verified (yes/no)].
   */
  async addToUserbase(email: string, name: string): Promise<boolean> {
    try {
      const payload = {
        action: 'addToUserbase',
        data: {
          email: email.trim().toLowerCase(),
          name: (name || '').trim() || email.split('@')[0],
          verified: 'yes',
        },
      };
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      let json: { success?: boolean; error?: string } = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch (_) {}
      if (!response.ok || json.success !== true) {
        console.error('addToUserbase failed:', json.error || response.status);
        return false;
      }
      return true;
    } catch (error) {
      console.error('addToUserbase error:', error);
      return false;
    }
  }

  /**
   * Check if the configured YouTube channel is currently live.
   * Apps Script scrapes the channel /live page and caches for 60s.
   */
  async getLiveStatus(): Promise<LiveStatus> {
    const empty: LiveStatus = { isLive: false, liveVideoId: null, channelUrl: '', liveTitle: null };
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getLiveStatus' }),
      });
      const text = await response.text();
      if (!response.ok) return empty;
      const json = JSON.parse(text) as Partial<LiveStatus>;
      return {
        isLive: json.isLive === true && !!json.liveVideoId,
        liveVideoId: json.liveVideoId || null,
        channelUrl: json.channelUrl || '',
        liveTitle: json.liveTitle || null,
      };
    } catch (error) {
      console.error('Error getting live status:', error);
      return empty;
    }
  }

  /**
   * Check if email exists in userbase sheet. Used for passwordless login.
   * Returns { exists: true, name: string } or { exists: false }.
   */
  async checkUserInUserbase(email: string): Promise<{ exists: boolean; name?: string }> {
    try {
      const payload = {
        action: 'checkUserInUserbase',
        data: { email: email.trim().toLowerCase() },
      };
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      let json: { exists?: boolean; name?: string; error?: string } = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch (_) {
        return { exists: false };
      }
      if (!response.ok) {
        return { exists: false };
      }
      if (json.exists === true && json.name != null) {
        return { exists: true, name: String(json.name) };
      }
      return { exists: false };
    } catch (error) {
      console.error('checkUserInUserbase error:', error);
      return { exists: false };
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;

