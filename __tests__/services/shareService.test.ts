/**
 * Unit tests for ShareService
 *
 * Tests cover:
 * - shareQuote: correct message format, reflection inclusion
 * - shareVideo: YouTube URL inclusion
 * - shareEvent: event details, location conditionally included
 * - shareApp: correct share message
 * - Platform-specific download link selection (iOS / Android / Web)
 */

jest.mock('@/config/env', () => ({
  env: {
    googleSheetsApiKey: 'test-key',
    googleSheetId: 'test-sheet',
    googleAppsScriptWebhookUrl: 'https://script.google.com/test',
    adminEmails: [],
    prayerRecipientEmail: 'prayer@example.com',
    appName: 'Siddhguru',
    appStoreLink: 'https://apps.apple.com/test-app',
    playStoreLink: 'https://play.google.com/test-app',
    webAppLink: 'https://test.spiritual.app',
  },
  validateEnv: jest.fn(),
}));

import { Share, Platform } from 'react-native';
import { shareService } from '@/services/shareService';

const mockShare = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as any);

const mockQuote = {
  id: 'q1',
  text: 'Peace comes from within',
  author: 'Siddhguru',
  category: 'Wisdom',
  dateAdded: '2024-01-01',
  reflection: 'Sit quietly and breathe',
};

const mockVideo = {
  id: 'v1',
  title: 'Morning Meditation',
  description: 'A guided session',
  youtubeId: 'abc123XYZ',
  dateAdded: '2024-01-01',
};

const mockEvent = {
  id: 'e1',
  title: 'Full Moon Satsang',
  date: '2024-03-25',
  time: '8:00 PM',
  description: 'Monthly gathering for meditation',
  location: 'Ashram Hall',
  type: 'meditation' as const,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── shareQuote ───────────────────────────────────────────────────────────────

describe('shareQuote()', () => {
  it('calls Share.share with the quote text and author', async () => {
    await shareService.shareQuote(mockQuote);

    expect(mockShare).toHaveBeenCalledTimes(1);
    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('Peace comes from within');
    expect(call.message).toContain('Siddhguru');
  });

  it('includes reflection when present', async () => {
    await shareService.shareQuote(mockQuote);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('Sit quietly and breathe');
    expect(call.message).toContain('Reflection:');
  });

  it('does not include "Reflection:" when reflection is absent', async () => {
    const quoteNoReflection = { ...mockQuote, reflection: undefined };

    await shareService.shareQuote(quoteNoReflection);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).not.toContain('Reflection:');
  });

  it('includes an app download link in the message', async () => {
    await shareService.shareQuote(mockQuote);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('https://');
  });

  it('includes the app name in the message', async () => {
    await shareService.shareQuote(mockQuote);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('Siddhguru');
  });

  it('rethrows errors from Share.share', async () => {
    mockShare.mockRejectedValueOnce(new Error('Share cancelled'));

    await expect(shareService.shareQuote(mockQuote)).rejects.toThrow('Share cancelled');
  });
});

// ─── shareVideo ───────────────────────────────────────────────────────────────

describe('shareVideo()', () => {
  it('calls Share.share with the video title', async () => {
    await shareService.shareVideo(mockVideo);

    const call = mockShare.mock.calls[0][0];
    expect(call.title).toBe('Morning Meditation');
    expect(call.message).toContain('Morning Meditation');
  });

  it('includes the YouTube URL with the videoId', async () => {
    await shareService.shareVideo(mockVideo);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('https://youtu.be/abc123XYZ');
  });

  it('includes an app download link', async () => {
    await shareService.shareVideo(mockVideo);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('https://');
  });

  it('rethrows errors from Share.share', async () => {
    mockShare.mockRejectedValueOnce(new Error('Share failed'));

    await expect(shareService.shareVideo(mockVideo)).rejects.toThrow('Share failed');
  });
});

// ─── shareEvent ───────────────────────────────────────────────────────────────

describe('shareEvent()', () => {
  it('calls Share.share with the event title and time', async () => {
    await shareService.shareEvent(mockEvent);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('Full Moon Satsang');
    expect(call.message).toContain('8:00 PM');
  });

  it('includes the event description', async () => {
    await shareService.shareEvent(mockEvent);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('Monthly gathering for meditation');
  });

  it('includes location when present', async () => {
    await shareService.shareEvent(mockEvent);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('Ashram Hall');
    expect(call.message).toContain('Location:');
  });

  it('omits location line when event has no location', async () => {
    const eventNoLocation = { ...mockEvent, location: undefined };

    await shareService.shareEvent(eventNoLocation);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).not.toContain('Location:');
  });

  it('uses the event title as Share title', async () => {
    await shareService.shareEvent(mockEvent);

    const call = mockShare.mock.calls[0][0];
    expect(call.title).toBe('Full Moon Satsang');
  });

  it('includes an app download link', async () => {
    await shareService.shareEvent(mockEvent);

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('https://');
  });

  it('rethrows errors from Share.share', async () => {
    mockShare.mockRejectedValueOnce(new Error('User cancelled'));

    await expect(shareService.shareEvent(mockEvent)).rejects.toThrow('User cancelled');
  });
});

// ─── shareApp ─────────────────────────────────────────────────────────────────

describe('shareApp()', () => {
  it('calls Share.share', async () => {
    await shareService.shareApp();

    expect(mockShare).toHaveBeenCalledTimes(1);
  });

  it('includes an app download link in the message', async () => {
    await shareService.shareApp();

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('https://');
  });
});

// ─── Platform-specific download links ────────────────────────────────────────

describe('platform-specific download link', () => {
  it('uses the iOS App Store link on iOS', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });

    await shareService.shareApp();

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('https://apps.apple.com/test-app');
  });

  it('uses the Play Store link on Android', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });

    await shareService.shareApp();

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('https://play.google.com/test-app');
  });

  it('uses the web app link on other platforms', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });

    await shareService.shareApp();

    const call = mockShare.mock.calls[0][0];
    expect(call.message).toContain('https://test.spiritual.app');
  });

  afterAll(() => {
    // Restore to iOS default
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
  });
});
