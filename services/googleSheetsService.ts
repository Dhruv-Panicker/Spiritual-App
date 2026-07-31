/**
 * Apps Script webhook relay — the last remnant of the Google Sheets backend.
 *
 * Everything else (auth, content, users, push tokens, prayer records) lives
 * in Supabase via supabaseService. Two things intentionally remain on the
 * Apps Script webhook because the free Supabase tier can't do them natively:
 *  - submitPrayer: emails the prayer (with optional photo) to the recipient
 *  - getLiveStatus: scrapes the YouTube channel /live page (cached 60s)
 * The webhook holds no data and no secrets.
 */

import { env } from '@/config/env';

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
  private get webhookUrl(): string {
    return env.googleAppsScriptWebhookUrl;
  }

  /**
   * Submit a prayer: sends data to Apps Script which emails the prayer to the
   * recipient and sends a confirmation email to the user. Throws on failure.
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
}

export const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
