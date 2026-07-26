/**
 * Supabase data service. Replaces googleSheetsService piece by piece
 * during the backend migration.
 *
 * Reads keep a last-good copy in AsyncStorage and serve it when the
 * network fails, so the app still shows content offline.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabaseClient';
import type { Quote, Video, Event, PrayerSubmissionData } from '@/services/googleSheetsService';

export type { Quote, Video, Event };

const CACHE_PREFIX = 'supabase-cache-';

// Converts a Google Drive sharing URL to a fast CDN-backed image URL.
// Kept during the migration: quote rows imported from the Sheet may still
// hold Drive links until images move to Supabase Storage. Storage URLs
// (and anything non-Drive) pass through unchanged.
function toDriveDirectUrl(url: string): string | undefined {
  if (!url.startsWith('http')) return undefined;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
  return url;
}

/** Format a Date as YYYY-MM-DD using local time (no UTC shifting). */
function toDateOnly(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

class SupabaseService {
  /** Run a fetch; on success refresh the offline cache, on failure serve it. */
  private async fetchWithCache<T>(key: string, fetcher: () => Promise<T[]>): Promise<T[]> {
    try {
      const rows = await fetcher();
      AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(rows)).catch(() => {});
      return rows;
    } catch (error) {
      console.error(`Error loading ${key} from Supabase:`, error);
      try {
        const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
        if (cached) {
          console.log(`Serving ${key} from offline cache`);
          return JSON.parse(cached) as T[];
        }
      } catch (_) {}
      return [];
    }
  }

  async getQuotes(): Promise<Quote[]> {
    return this.fetchWithCache<Quote>('quotes', async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('id, text, author, category, image_url, created_at')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || [])
        .map((row): Quote => ({
          id: row.id,
          text: row.text || '',
          author: row.author || 'Unknown',
          category: row.category || 'General',
          dateAdded: row.created_at,
          imageUrl: toDriveDirectUrl((row.image_url || '').trim()),
        }))
        .filter((quote) => quote.text.trim().length > 0 || !!quote.imageUrl);
    });
  }

  async addQuote(quote: Omit<Quote, 'id' | 'dateAdded'>): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        text: quote.text || '',
        author: quote.author || '',
        category: quote.category || '',
        image_url: quote.imageUrl || null,
      })
      .select('id, text, author, category, image_url, created_at')
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      text: data.text,
      author: data.author || 'Unknown',
      category: data.category || 'General',
      dateAdded: data.created_at,
      imageUrl: toDriveDirectUrl((data.image_url || '').trim()),
    };
  }

  async getVideos(): Promise<Video[]> {
    return this.fetchWithCache<Video>('videos', async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, description, youtube_id, created_at')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data || [])
        .map((row): Video => ({
          id: row.id,
          title: row.title || '',
          description: row.description || '',
          youtubeId: row.youtube_id || '',
          dateAdded: row.created_at,
        }))
        .filter((video) => video.youtubeId.trim().length > 0 && video.title.trim().length > 0);
    });
  }

  async addVideo(video: Omit<Video, 'id' | 'dateAdded'>): Promise<Video> {
    const { data, error } = await supabase
      .from('videos')
      .insert({
        title: video.title || '',
        description: video.description || '',
        youtube_id: video.youtubeId || '',
      })
      .select('id, title, description, youtube_id, created_at')
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      youtubeId: data.youtube_id,
      dateAdded: data.created_at,
    };
  }

  async getEvents(): Promise<Event[]> {
    return this.fetchWithCache<Event>('events', async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date, event_time, description, location, event_type, link')
        .order('event_date', { ascending: true });
      if (error) throw new Error(error.message);
      return (data || [])
        .map((row): Event => ({
          id: row.id,
          title: row.title || '',
          // T00:00:00 (no zone) parses as LOCAL midnight in new Date() —
          // bare YYYY-MM-DD would parse as UTC and shift the day back in
          // negative-offset timezones, and Hermes can't parse slash dates.
          date: row.event_date ? `${row.event_date}T00:00:00` : '',
          time: row.event_time || '',
          description: row.description || '',
          location: row.location || undefined,
          type: row.event_type as Event['type'],
          link: row.link || undefined,
        }))
        .filter((event) => event.title.length > 0 && event.date.length > 0);
    });
  }

  async addEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const parsed = new Date(event.date);
    if (isNaN(parsed.getTime())) {
      throw new Error('Invalid event date. Use a format like 2026-08-15.');
    }
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: event.title || '',
        event_date: toDateOnly(parsed),
        event_time: event.time || '',
        description: event.description || '',
        location: event.location || null,
        event_type: event.type,
        link: event.link || null,
      })
      .select('id, title, event_date, event_time, description, location, event_type, link')
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      title: data.title,
      date: data.event_date ? `${data.event_date}T00:00:00` : '',
      time: data.event_time || '',
      description: data.description || '',
      location: data.location || undefined,
      type: data.event_type as Event['type'],
      link: data.link || undefined,
    };
  }

  /** Save/refresh this device's push token, tied to the signed-in user. */
  async savePushToken(email: string, pushToken: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('push_tokens').upsert(
        {
          token: pushToken,
          email: email.trim().toLowerCase(),
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      );
      if (error) {
        console.error('savePushToken error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('savePushToken error:', err);
      return false;
    }
  }

  /** Best-effort login log (replaces the Sheets login sheet). */
  async logLogin(email: string, isAdmin: boolean): Promise<boolean> {
    try {
      const { error } = await supabase.from('login_logs').insert({
        email: email.trim().toLowerCase(),
        is_admin: isAdmin,
      });
      if (error) {
        console.error('logLogin error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('logLogin error:', err);
      return false;
    }
  }

  /**
   * Best-effort record of a prayer submission (the email to the recipient is
   * the primary delivery; this keeps a queryable copy for the admins).
   */
  async recordPrayer(data: PrayerSubmissionData): Promise<boolean> {
    try {
      const { error } = await supabase.from('prayers').insert({
        name: data.name,
        date_of_birth: data.dateOfBirth,
        city: data.city,
        country: data.country,
        phone: data.phone,
        email: data.email.trim().toLowerCase(),
        prayer: data.prayer,
      });
      if (error) {
        console.error('recordPrayer error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('recordPrayer error:', err);
      return false;
    }
  }

  /**
   * All registered push tokens, for admin broadcasts. RLS only returns rows
   * to admins — every other caller gets an empty list.
   */
  async getPushTokens(): Promise<string[]> {
    try {
      const { data, error } = await supabase.from('push_tokens').select('token');
      if (error) {
        console.error('getPushTokens error:', error.message);
        return [];
      }
      return (data || []).map((row) => row.token).filter(Boolean);
    } catch (err) {
      console.error('getPushTokens error:', err);
      return [];
    }
  }

  /**
   * Check whether an account already exists for this email (pre-signup check).
   * Fails open (false) so a transient error never blocks sign-up — signing up
   * with an existing email just behaves like a login.
   */
  async checkUserExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('user_exists', {
        check_email: email.trim().toLowerCase(),
      });
      if (error) {
        console.error('checkUserExists error:', error.message);
        return false;
      }
      return data === true;
    } catch (err) {
      console.error('checkUserExists error:', err);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
