// Google Sheets Service - Simple REST API approach

// No authentication required for public read-only sheetsconst { google } = require('googleapis');



const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your actual sheet IDclass GoogleSheetsService {

const API_KEY = 'YOUR_GOOGLE_API_KEY_HERE'; // Replace with your actual API key  constructor() {

    // Initialize Google Sheets API

// Base URL for Google Sheets API    const auth = new google.auth.GoogleAuth({

const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;      credentials: this.getCredentials(),

      scopes: ['https://www.googleapis.com/auth/spreadsheets'],

class GoogleSheetsService {    });

  

  // Generic method to read data from any sheet    this.sheets = google.sheets({ version: 'v4', auth });

  async readSheet(sheetName, range = '') {    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';

    try {  }

      const url = `${BASE_URL}/${sheetName}${range ? `!${range}` : ''}?key=${API_KEY}`;

      const response = await fetch(url);  getCredentials() {

          try {

      if (!response.ok) {      // Parse credentials from environment variable

        throw new Error(`HTTP error! status: ${response.status}`);      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');

      }      return credentials;

          } catch (error) {

      const data = await response.json();      console.error('Error parsing Google credentials:', error);

      return data.values || [];      return {};

    } catch (error) {    }

      console.error(`Error reading sheet ${sheetName}:`, error);  }

      throw error;

    }  async logUserLogin(userData) {

  }    try {

      const values = [

  // Generic method to write data to sheet (requires Apps Script)        [

  async writeToSheet(sheetName, data) {          userData.email,

    try {          userData.name,

      // This will call our Apps Script web app          userData.loginTime,

      const SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE'; // We'll create this          userData.isAdmin ? 'Yes' : 'No'

              ]

      const response = await fetch(SCRIPT_URL, {      ];

        method: 'POST',

        headers: {      const resource = {

          'Content-Type': 'application/json',        values,

        },      };

        body: JSON.stringify({

          action: 'append',      await this.sheets.spreadsheets.values.append({

          sheetName: sheetName,        spreadsheetId: this.spreadsheetId,

          data: data        range: 'Sheet1!A:D', // Adjust range as needed

        })        valueInputOption: 'RAW',

      });        resource,

      });

      if (!response.ok) {

        throw new Error(`HTTP error! status: ${response.status}`);      console.log('User login logged to Google Sheets successfully');

      }      return true;

    } catch (error) {

      return await response.json();      console.error('Error logging to Google Sheets:', error);

    } catch (error) {      return false;

      console.error(`Error writing to sheet ${sheetName}:`, error);    }

      throw error;  }

    }

  }  async initializeSheet() {

    try {

  // USER METHODS      // Check if headers exist, if not add them

  async getUsers() {      const response = await this.sheets.spreadsheets.values.get({

    try {        spreadsheetId: this.spreadsheetId,

      const rows = await this.readSheet('users');        range: 'Sheet1!A1:D1',

      if (!rows.length) return [];      });

      

      const [headers, ...dataRows] = rows;      if (!response.data.values || response.data.values.length === 0) {

      return dataRows.map(row => ({        // Add headers

        email: row[0] || '',        const headerValues = [['Email', 'Name', 'Login Time', 'Is Admin']];

        password: row[1] || '',        

        isAdmin: row[2] === 'TRUE' || row[2] === 'true',        await this.sheets.spreadsheets.values.update({

        createdAt: row[3] || ''          spreadsheetId: this.spreadsheetId,

      }));          range: 'Sheet1!A1:D1',

    } catch (error) {          valueInputOption: 'RAW',

      console.error('Error getting users:', error);          resource: { values: headerValues },

      return [];        });

    }

  }        console.log('Sheet headers initialized');

      }

  async findUser(email, password) {    } catch (error) {

    try {      console.error('Error initializing sheet:', error);

      const users = await this.getUsers();    }

      return users.find(user =>   }

        user.email.toLowerCase() === email.toLowerCase() && }

        user.password === password

      );const googleSheetsService = new GoogleSheetsService();

    } catch (error) {module.exports = { googleSheetsService };

      console.error('Error finding user:', error);
      return null;
    }
  }

  // QUOTES METHODS
  async getQuotes() {
    try {
      const rows = await this.readSheet('quotes');
      if (!rows.length) return [];
      
      const [headers, ...dataRows] = rows;
      return dataRows.map((row, index) => ({
        id: row[0] || `quote_${index + 1}`,
        text: row[1] || '',
        author: row[2] || 'Unknown',
        category: row[3] || 'General',
        dateAdded: row[4] || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error getting quotes:', error);
      return [];
    }
  }

  async addQuote(quote) {
    try {
      const newQuote = {
        id: `quote_${Date.now()}`,
        text: quote.text,
        author: quote.author || 'Unknown',
        category: quote.category || 'General',
        dateAdded: new Date().toISOString()
      };

      const rowData = [
        newQuote.id,
        newQuote.text,
        newQuote.author,
        newQuote.category,
        newQuote.dateAdded
      ];

      await this.writeToSheet('quotes', [rowData]);
      return newQuote;
    } catch (error) {
      console.error('Error adding quote:', error);
      throw error;
    }
  }

  async removeQuote(id) {
    try {
      // Note: For Google Sheets, we'll need to implement this in Apps Script
      const response = await fetch('YOUR_APPS_SCRIPT_URL_HERE', {
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

  async updateQuote(id, updatedData) {
    try {
      const response = await fetch('YOUR_APPS_SCRIPT_URL_HERE', {
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
        return { id, ...updatedData };
      }
      return null;
    } catch (error) {
      console.error('Error updating quote:', error);
      return null;
    }
  }

  // VIDEOS METHODS  
  async getVideos() {
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

  async addVideo(video) {
    try {
      const newVideo = {
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

      await this.writeToSheet('videos', [rowData]);
      return newVideo;
    } catch (error) {
      console.error('Error adding video:', error);
      throw error;
    }
  }

  async removeVideo(id) {
    try {
      const response = await fetch('YOUR_APPS_SCRIPT_URL_HERE', {
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

  async updateVideo(id, updatedData) {
    try {
      const response = await fetch('YOUR_APPS_SCRIPT_URL_HERE', {
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
        return { id, ...updatedData };
      }
      return null;
    } catch (error) {
      console.error('Error updating video:', error);
      return null;
    }
  }

  // INITIALIZATION - Add sample data if sheets are empty
  async initializeWithSampleData() {
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
            category: "Wisdom"
          },
          {
            text: "Peace comes from within. Do not seek it without.",
            author: "Buddha", 
            category: "Peace"
          },
          {
            text: "Three things cannot be long hidden: the sun, the moon, and the truth.",
            author: "Buddha",
            category: "Truth"
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
}

// Export singleton instance  
export const googleSheetsService = new GoogleSheetsService();