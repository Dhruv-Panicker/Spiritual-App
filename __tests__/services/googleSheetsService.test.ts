/**
 * Unit tests for GoogleSheetsService
 *
 * Tests cover:
 * - Data parsing (quotes, videos, events)
 * - Error handling (network failures, HTTP errors, malformed data)
 * - Write operations (add quote, video, event)
 * - Auth operations (checkUserInUserbase, addToUserbase)
 * - Push token management
 * - Prayer submission
 */

jest.mock('@/config/env', () => ({
  env: {
    googleSheetsApiKey: 'test-api-key',
    googleSheetId: 'test-sheet-id',
    googleAppsScriptWebhookUrl: 'https://script.google.com/test-webhook',
    adminEmails: ['admin@example.com'],
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

// ─── getQuotes ────────────────────────────────────────────────────────────────

describe('getQuotes()', () => {
  it('parses rows correctly, skipping the header row', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['id', 'text', 'author', 'category', 'dateAdded', 'reflection'],
          ['q1', 'Peace begins within', 'Siddhguru', 'Meditation', '2024-01-01', 'Breathe deeply'],
          ['q2', 'Love is the path', 'Siddhguru', 'Love', '2024-01-02', ''],
        ],
      })
    );

    const quotes = await googleSheetsService.getQuotes();

    expect(quotes).toHaveLength(2);
    expect(quotes[0]).toMatchObject({
      id: 'q1',
      text: 'Peace begins within',
      author: 'Siddhguru',
      category: 'Meditation',
      reflection: 'Breathe deeply',
    });
    expect(quotes[1].reflection).toBeUndefined();
  });

  it('filters out quotes with empty text', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['id', 'text', 'author', 'category', 'dateAdded'],
          ['q1', '', 'Siddhguru', 'General', '2024-01-01'],
          ['q2', '   ', 'Siddhguru', 'General', '2024-01-02'],
          ['q3', 'Valid quote', 'Siddhguru', 'General', '2024-01-03'],
        ],
      })
    );

    const quotes = await googleSheetsService.getQuotes();

    expect(quotes).toHaveLength(1);
    expect(quotes[0].id).toBe('q3');
  });

  it('returns empty array when sheet is empty', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ values: [] }));

    const quotes = await googleSheetsService.getQuotes();

    expect(quotes).toEqual([]);
  });

  it('returns empty array on HTTP error (does not throw)', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(403, 'Forbidden'));

    const quotes = await googleSheetsService.getQuotes();

    expect(quotes).toEqual([]);
  });

  it('returns empty array on network failure (does not throw)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const quotes = await googleSheetsService.getQuotes();

    expect(quotes).toEqual([]);
  });

  it('uses fallback values for missing columns', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['id', 'text'],
          [undefined, 'A quote with missing fields'],
        ],
      })
    );

    const quotes = await googleSheetsService.getQuotes();

    expect(quotes).toHaveLength(1);
    expect(quotes[0].author).toBe('Unknown');
    expect(quotes[0].category).toBe('General');
  });
});

// ─── getVideos ────────────────────────────────────────────────────────────────

describe('getVideos()', () => {
  it('parses video rows correctly', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['id', 'title', 'description', 'youtubeId', 'dateAdded'],
          ['v1', 'Morning Meditation', 'A guided session', 'abc123', '2024-01-01'],
          ['v2', 'Evening Prayer', 'Wind down with prayer', 'xyz789', '2024-01-02'],
        ],
      })
    );

    const videos = await googleSheetsService.getVideos();

    expect(videos).toHaveLength(2);
    expect(videos[0]).toMatchObject({
      id: 'v1',
      title: 'Morning Meditation',
      youtubeId: 'abc123',
    });
  });

  it('filters out videos with missing youtubeId or title', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['id', 'title', 'description', 'youtubeId', 'dateAdded'],
          ['v1', '', 'desc', 'abc123', '2024-01-01'],
          ['v2', 'Valid', 'desc', '', '2024-01-01'],
          ['v3', 'Also Valid', 'desc', 'yt999', '2024-01-01'],
        ],
      })
    );

    const videos = await googleSheetsService.getVideos();

    expect(videos).toHaveLength(1);
    expect(videos[0].id).toBe('v3');
  });

  it('returns empty array on error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fetch failed'));

    const videos = await googleSheetsService.getVideos();

    expect(videos).toEqual([]);
  });
});

// ─── getEvents ────────────────────────────────────────────────────────────────

describe('getEvents()', () => {
  it('parses event rows and skips header', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['id', 'title', 'date', 'time', 'description', 'location', 'type', 'link'],
          ['e1', 'Morning Satsang', '2024-03-15', '7:00 AM', 'Daily meditation', 'Ashram', 'meditation', 'https://zoom.us'],
          ['e2', 'Teachings', '2024-04-01', '6:00 PM', 'Weekly teaching', '', 'teaching', ''],
        ],
      })
    );

    const events = await googleSheetsService.getEvents();

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      id: 'e1',
      title: 'Morning Satsang',
      type: 'meditation',
      location: 'Ashram',
      link: 'https://zoom.us',
    });
    expect(events[1].location).toBeUndefined();
    expect(events[1].link).toBeUndefined();
  });

  it('defaults invalid event type to "meditation"', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['id', 'title', 'date', 'time', 'description', 'location', 'type'],
          ['e1', 'Mystery Event', '2024-05-01', '10:00 AM', 'Desc', '', 'unknowntype'],
        ],
      })
    );

    const events = await googleSheetsService.getEvents();

    expect(events[0].type).toBe('meditation');
  });

  it('accepts all valid event types', async () => {
    const validTypes = ['meditation', 'teaching', 'celebration', 'retreat'];
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['id', 'title', 'date', 'time', 'description', 'location', 'type'],
          ...validTypes.map((t, i) => [
            `e${i}`, `Event ${i}`, '2024-06-01', '9:00 AM', 'Desc', '', t,
          ]),
        ],
      })
    );

    const events = await googleSheetsService.getEvents();

    events.forEach((e, i) => {
      expect(e.type).toBe(validTypes[i]);
    });
  });

  it('filters events with missing title or date', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['id', 'title', 'date', 'time', 'description', 'location', 'type'],
          ['e1', '', '2024-03-01', '9:00', 'Desc', '', 'meditation'],
          ['e2', 'No Date', '', '9:00', 'Desc', '', 'teaching'],
          ['e3', 'Valid', '2024-03-01', '9:00', 'Desc', '', 'retreat'],
        ],
      })
    );

    const events = await googleSheetsService.getEvents();

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('e3');
  });

  it('returns empty array on error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'));

    const events = await googleSheetsService.getEvents();

    expect(events).toEqual([]);
  });
});

// ─── addQuote ─────────────────────────────────────────────────────────────────

describe('addQuote()', () => {
  it('returns a Quote with generated id and dateAdded', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 0, text: jest.fn() });

    const quote = await googleSheetsService.addQuote({
      text: 'New quote',
      author: 'Siddhguru',
      category: 'Wisdom',
      reflection: 'Reflect on this',
    });

    expect(quote.id).toMatch(/^quote_\d+$/);
    expect(quote.text).toBe('New quote');
    expect(quote.author).toBe('Siddhguru');
    expect(quote.dateAdded).toBeTruthy();
  });

  it('sends the correct payload to the webhook', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 0, text: jest.fn() });

    await googleSheetsService.addQuote({
      text: 'Test',
      author: 'Test Author',
      category: 'General',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://script.google.com/test-webhook',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"sheetName":"quotes"'),
      })
    );
  });

  it('throws when fetch rejects', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network down'));

    await expect(
      googleSheetsService.addQuote({ text: 'x', author: 'y', category: 'z' })
    ).rejects.toThrow('Network down');
  });
});

// ─── addVideo ─────────────────────────────────────────────────────────────────

describe('addVideo()', () => {
  it('returns a Video with generated id and dateAdded', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 0, text: jest.fn() });

    const video = await googleSheetsService.addVideo({
      title: 'Meditation Guide',
      description: 'A peaceful guide',
      youtubeId: 'abc123xyz',
    });

    expect(video.id).toMatch(/^video_\d+$/);
    expect(video.youtubeId).toBe('abc123xyz');
    expect(video.dateAdded).toBeTruthy();
  });

  it('sends the correct sheetName in payload', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 0, text: jest.fn() });

    await googleSheetsService.addVideo({
      title: 'T',
      description: 'D',
      youtubeId: 'yt1',
    });

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.sheetName).toBe('videos');
  });
});

// ─── addEvent ─────────────────────────────────────────────────────────────────

describe('addEvent()', () => {
  it('returns an Event with generated id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 0, text: jest.fn() });

    const event = await googleSheetsService.addEvent({
      title: 'Full Moon Meditation',
      date: '2024-03-25',
      time: '8:00 PM',
      description: 'Monthly gathering',
      type: 'meditation',
    });

    expect(event.id).toMatch(/^event_\d+$/);
    expect(event.title).toBe('Full Moon Meditation');
    expect(event.type).toBe('meditation');
  });

  it('includes location and link in payload when provided', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 0, text: jest.fn() });

    await googleSheetsService.addEvent({
      title: 'Retreat',
      date: '2024-07-01',
      time: '9:00 AM',
      description: 'Annual retreat',
      type: 'retreat',
      location: 'Ashram Grounds',
      link: 'https://register.com',
    });

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.data).toContain('Ashram Grounds');
    expect(body.data).toContain('https://register.com');
  });
});

// ─── checkUserInUserbase ──────────────────────────────────────────────────────

describe('checkUserInUserbase()', () => {
  it('returns { exists: true, name } when user is found', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({ exists: true, name: 'Dhruv Panicker' })
    );

    const result = await googleSheetsService.checkUserInUserbase('dhruv@example.com');

    expect(result).toEqual({ exists: true, name: 'Dhruv Panicker' });
  });

  it('returns { exists: false } when user is not found', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ exists: false }));

    const result = await googleSheetsService.checkUserInUserbase('unknown@example.com');

    expect(result).toEqual({ exists: false });
  });

  it('normalizes email to lowercase before sending', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ exists: false }));

    await googleSheetsService.checkUserInUserbase('UPPER@EXAMPLE.COM');

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.data.email).toBe('upper@example.com');
  });

  it('returns { exists: false } on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500));

    const result = await googleSheetsService.checkUserInUserbase('test@example.com');

    expect(result).toEqual({ exists: false });
  });

  it('returns { exists: false } on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await googleSheetsService.checkUserInUserbase('test@example.com');

    expect(result).toEqual({ exists: false });
  });

  it('returns { exists: false } on invalid JSON response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: jest.fn(() => Promise.resolve('not valid json {')),
    });

    const result = await googleSheetsService.checkUserInUserbase('test@example.com');

    expect(result).toEqual({ exists: false });
  });
});

// ─── addToUserbase ────────────────────────────────────────────────────────────

describe('addToUserbase()', () => {
  it('returns true on success', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    const result = await googleSheetsService.addToUserbase('user@example.com', 'User Name');

    expect(result).toBe(true);
  });

  it('normalizes email to lowercase', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    await googleSheetsService.addToUserbase('USER@EXAMPLE.COM', 'Test');

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.data.email).toBe('user@example.com');
  });

  it('sets verified to "yes"', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    await googleSheetsService.addToUserbase('user@example.com', 'Name');

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.data.verified).toBe('yes');
  });

  it('returns false on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500, 'Server error'));

    const result = await googleSheetsService.addToUserbase('user@example.com', 'Name');

    expect(result).toBe(false);
  });

  it('returns false when success is not true', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: false, error: 'Already exists' }));

    const result = await googleSheetsService.addToUserbase('user@example.com', 'Name');

    expect(result).toBe(false);
  });

  it('returns false on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await googleSheetsService.addToUserbase('user@example.com', 'Name');

    expect(result).toBe(false);
  });
});

// ─── savePushToken ────────────────────────────────────────────────────────────

describe('savePushToken()', () => {
  it('returns false when email is missing', async () => {
    const result = await googleSheetsService.savePushToken('', 'ExponentPushToken[abc]');

    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns false when token is missing', async () => {
    const result = await googleSheetsService.savePushToken('user@example.com', '');

    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends correct payload and returns true on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 0, text: jest.fn() });

    const result = await googleSheetsService.savePushToken(
      'user@example.com',
      'ExponentPushToken[test]'
    );

    expect(result).toBe(true);
    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.action).toBe('savePushToken');
    expect(body.data.email).toBe('user@example.com');
    expect(body.data.pushToken).toBe('ExponentPushToken[test]');
  });

  it('returns false on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await googleSheetsService.savePushToken(
      'user@example.com',
      'ExponentPushToken[abc]'
    );

    expect(result).toBe(false);
  });
});

// ─── logUserLogin ─────────────────────────────────────────────────────────────

describe('logUserLogin()', () => {
  it('returns true on successful webhook call', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 0, text: jest.fn() });

    const result = await googleSheetsService.logUserLogin({
      email: 'user@example.com',
      name: 'User',
      loginTime: new Date().toISOString(),
      isAdmin: false,
    });

    expect(result).toBe(true);
  });

  it('returns false on network failure but does not throw (caller ignores the return value)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await googleSheetsService.logUserLogin({
      email: 'user@example.com',
      name: 'User',
      loginTime: new Date().toISOString(),
      isAdmin: false,
    });

    // Returns false on network failure; callers (.catch(() => {})) ignore this
    expect(result).toBe(false);
  });

  it('sends correct action in payload', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 0, text: jest.fn() });

    await googleSheetsService.logUserLogin({
      email: 'admin@example.com',
      name: 'Admin',
      loginTime: '2024-01-01T00:00:00Z',
      isAdmin: true,
    });

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.action).toBe('logUserLogin');
    expect(body.data.email).toBe('admin@example.com');
    expect(body.data.isAdmin).toBe(true);
  });
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

// ─── getPushTokens ────────────────────────────────────────────────────────────

describe('getPushTokens()', () => {
  it('extracts push tokens from rows, skipping header', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['email', 'pushToken', 'platform', 'lastUpdated'],
          ['user1@test.com', 'ExponentPushToken[aaa]', 'ios', '2024-01-01'],
          ['user2@test.com', 'ExponentPushToken[bbb]', 'android', '2024-01-02'],
        ],
      })
    );

    const tokens = await googleSheetsService.getPushTokens();

    expect(tokens).toEqual(['ExponentPushToken[aaa]', 'ExponentPushToken[bbb]']);
  });

  it('filters out empty or null tokens', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        values: [
          ['email', 'pushToken', 'platform', 'lastUpdated'],
          ['user1@test.com', '', 'ios', '2024-01-01'],
          ['user2@test.com', 'ExponentPushToken[valid]', 'ios', '2024-01-01'],
          ['user3@test.com', '   ', 'ios', '2024-01-01'],
        ],
      })
    );

    const tokens = await googleSheetsService.getPushTokens();

    expect(tokens).toEqual(['ExponentPushToken[valid]']);
  });

  it('returns empty array when sheet is empty', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ values: [] }));

    const tokens = await googleSheetsService.getPushTokens();

    expect(tokens).toEqual([]);
  });

  it('returns empty array on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const tokens = await googleSheetsService.getPushTokens();

    expect(tokens).toEqual([]);
  });
});
