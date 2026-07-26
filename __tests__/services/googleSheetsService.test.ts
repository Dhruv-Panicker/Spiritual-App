/**
 * Unit tests for the Apps Script webhook relay (googleSheetsService).
 * Only prayer email submission and YouTube live status remain here —
 * all data operations moved to supabaseService.
 */

jest.mock('@/config/env', () => ({
  env: {
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-anon-key',
    googleAppsScriptWebhookUrl: 'https://script.google.com/test-webhook',
    prayerRecipientEmail: 'prayer@example.com',
    appName: 'Test App',
    appStoreLink: 'https://apps.apple.com/test',
    playStoreLink: 'https://play.google.com/test',
    webAppLink: 'https://test.app',
  },
  validateEnv: jest.fn(),
}));

import { googleSheetsService } from '@/services/googleSheetsService';

const mockFetch = global.fetch as jest.Mock;

function makeOkResponse(data: object) {
  return {
    ok: true,
    status: 200,
    json: jest.fn(() => Promise.resolve(data)),
    text: jest.fn(() => Promise.resolve(JSON.stringify(data))),
  };
}

function makeErrorResponse(status: number, body = '') {
  return {
    ok: false,
    status,
    json: jest.fn(() => Promise.resolve({ error: body })),
    text: jest.fn(() => Promise.resolve(body)),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── submitPrayer ─────────────────────────────────────────────────────────────

describe('submitPrayer()', () => {
  const validPrayerData = {
    name: 'Dhruv',
    dateOfBirth: '01/01/1990',
    city: 'Mumbai',
    country: 'India',
    phone: '+91 9999999999',
    email: 'dhruv@example.com',
    prayer: 'Please bless my family',
    hasPhoto: false,
  };

  it('returns { success: true } on success', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    const result = await googleSheetsService.submitPrayer(
      validPrayerData,
      'prayer@example.com'
    );

    expect(result).toEqual({ success: true });
  });

  it('sends action "submitPrayer" in payload', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    await googleSheetsService.submitPrayer(validPrayerData, 'prayer@example.com');

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.action).toBe('submitPrayer');
    expect(body.data.name).toBe('Dhruv');
    expect(body.recipientEmail).toBe('prayer@example.com');
  });

  it('includes photo data when provided', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    await googleSheetsService.submitPrayer(
      { ...validPrayerData, hasPhoto: true, photoBase64: 'base64data', photoMimeType: 'image/png' },
      'prayer@example.com'
    );

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.data.photoBase64).toBe('base64data');
    expect(body.data.photoMimeType).toBe('image/png');
  });

  it('omits photo fields when no photo attached', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    await googleSheetsService.submitPrayer(validPrayerData, 'prayer@example.com');

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.data.photoBase64).toBeUndefined();
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500, 'Server error'));

    await expect(
      googleSheetsService.submitPrayer(validPrayerData, 'prayer@example.com')
    ).rejects.toThrow();
  });

  it('throws when response JSON has success !== true', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: false, error: 'Bad request' }));

    await expect(
      googleSheetsService.submitPrayer(validPrayerData, 'prayer@example.com')
    ).rejects.toThrow('Bad request');
  });

  it('throws on invalid JSON response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: jest.fn(() => Promise.resolve('not-json')),
    });

    await expect(
      googleSheetsService.submitPrayer(validPrayerData, 'prayer@example.com')
    ).rejects.toThrow('Invalid response from server');
  });
});

// ─── getLiveStatus ────────────────────────────────────────────────────────────

describe('getLiveStatus()', () => {
  const emptyStatus = { isLive: false, liveVideoId: null, channelUrl: '', liveTitle: null };

  it('sends action "getLiveStatus" in payload', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(emptyStatus));

    await googleSheetsService.getLiveStatus();

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.action).toBe('getLiveStatus');
  });

  it('returns live status when the channel is live', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({
      isLive: true,
      liveVideoId: 'abc123',
      channelUrl: 'https://youtube.com/@test',
      liveTitle: 'Morning Meditation',
    }));

    const result = await googleSheetsService.getLiveStatus();

    expect(result.isLive).toBe(true);
    expect(result.liveVideoId).toBe('abc123');
    expect(result.liveTitle).toBe('Morning Meditation');
  });

  it('treats isLive without a video id as not live', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ isLive: true, liveVideoId: null }));

    const result = await googleSheetsService.getLiveStatus();

    expect(result.isLive).toBe(false);
  });

  it('returns empty status on HTTP error (does not throw)', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500, 'Server error'));

    const result = await googleSheetsService.getLiveStatus();

    expect(result).toEqual(emptyStatus);
  });

  it('returns empty status on network failure (does not throw)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network down'));

    const result = await googleSheetsService.getLiveStatus();

    expect(result).toEqual(emptyStatus);
  });
});
