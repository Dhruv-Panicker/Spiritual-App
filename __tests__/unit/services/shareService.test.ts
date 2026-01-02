// Override react-native mock for this test - create mock function inside factory
jest.mock('react-native', () => {
  // Create mock function inside factory - cannot reference outside variables
  const mockShareFn = jest.fn(() => Promise.resolve({ action: 'sharedAction' }));
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
      Version: 0,
    },
    Share: {
      share: mockShareFn,
      sharedAction: 'sharedAction',
    },
  };
});

import { Platform, Share } from 'react-native';
import { shareService } from '@/services/shareService';

describe('ShareService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Share.share mock - access via Share.share since shareMock might not be accessible
    (Share.share as jest.Mock).mockClear();
    (Share.share as jest.Mock).mockResolvedValue({ action: Share.sharedAction });
  });

  describe('shareQuote', () => {
    it('should share quote with correct format on iOS', async () => {
      Platform.OS = 'ios';
      const quote = {
        text: 'Test quote text',
        author: 'Test Author',
      };

      await shareService.shareQuote(quote);

      expect(Share.share).toHaveBeenCalledWith({
        message: expect.stringContaining(quote.text),
        title: expect.stringContaining('Quote'),
      });
    });

    it('should share quote with correct format on Android', async () => {
      Platform.OS = 'android';
      const quote = {
        text: 'Test quote text',
        author: 'Test Author',
      };

      await shareService.shareQuote(quote);

      expect(Share.share).toHaveBeenCalled();
    });

    it('should handle share errors gracefully', async () => {
      Platform.OS = 'ios';
      const quote = {
        text: 'Test quote',
        author: 'Test Author',
      };

      (Share.share as jest.Mock).mockRejectedValueOnce(new Error('Share failed'));

      await expect(shareService.shareQuote(quote)).rejects.toThrow('Share failed');
    });
  });

  describe('shareVideo', () => {
    it('should share video with correct format', async () => {
      const video = {
        title: 'Test Video',
        youtubeId: 'test123',
      };

      await shareService.shareVideo(video);

      expect(Share.share).toHaveBeenCalledWith({
        message: expect.stringContaining(video.title),
        title: video.title,
      });
    });
  });

  describe('shareEvent', () => {
    it('should share event with correct format', async () => {
      const event = {
        title: 'Test Event',
        date: '2024-12-31',
        type: 'satsang',
        description: 'Test description',
      };

      await shareService.shareEvent(event);

      expect(Share.share).toHaveBeenCalledWith({
        message: expect.stringContaining(event.title),
        title: expect.stringContaining('Event'),
      });
    });
  });

  describe('shareApp', () => {
    it('should return iOS App Store link on iOS', () => {
      Platform.OS = 'ios';
      const link = shareService['getDownloadLink']();
      expect(link).toBe(shareService['appStoreLink']);
    });

    it('should return Play Store link on Android', () => {
      Platform.OS = 'android';
      const link = shareService['getDownloadLink']();
      expect(link).toBe(shareService['playStoreLink']);
    });
  });
});

