/**
 * Tests for VideosContext / VideosProvider
 *
 * Tests cover:
 * - Loads videos on mount
 * - addVideo() prepends to state
 * - refreshVideos() re-fetches
 * - Error handling during load
 * - useVideos() throws outside provider
 */

jest.mock('@/config/env', () => ({
  env: {
    googleSheetsApiKey: 'test-key',
    googleSheetId: 'test-sheet',
    googleAppsScriptWebhookUrl: 'https://script.google.com/test',
    adminEmails: [],
    prayerRecipientEmail: 'prayer@example.com',
    appName: 'Test App',
    appStoreLink: '',
    playStoreLink: '',
    webAppLink: '',
  },
  validateEnv: jest.fn(),
}));

jest.mock('@/services/googleSheetsService', () => ({
  googleSheetsService: {
    getVideos: jest.fn(),
    addVideo: jest.fn(),
  },
}));

import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import { VideosProvider, useVideos } from '@/contexts/VideosContext';
import { googleSheetsService } from '@/services/googleSheetsService';

const mockGetVideos = googleSheetsService.getVideos as jest.Mock;
const mockAddVideo = googleSheetsService.addVideo as jest.Mock;

const sampleVideos = [
  { id: 'v1', title: 'Morning Meditation', description: 'Guided session', youtubeId: 'abc123', dateAdded: '2024-01-01' },
  { id: 'v2', title: 'Evening Prayer', description: 'Wind down', youtubeId: 'xyz789', dateAdded: '2024-01-02' },
];

function VideosTestComponent() {
  const { videos, loading, addVideo, refreshVideos } = useVideos();
  return (
    <>
      <Text testID="loading">{loading ? 'loading' : 'ready'}</Text>
      <Text testID="count">{videos.length}</Text>
      <Text testID="first-title">{videos[0]?.title ?? ''}</Text>
      <Text testID="add-video" onPress={() => addVideo({ title: 'New', description: 'D', youtubeId: 'yt1' })} />
      <Text testID="refresh" onPress={() => refreshVideos()} />
    </>
  );
}

function renderWithProvider() {
  return render(
    <VideosProvider>
      <VideosTestComponent />
    </VideosProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('VideosProvider', () => {
  it('starts loading and fetches videos on mount', async () => {
    mockGetVideos.mockResolvedValueOnce(sampleVideos);

    const { getByTestId } = renderWithProvider();

    expect(getByTestId('loading').props.children).toBe('loading');

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('count').props.children).toBe(2);
    });
  });

  it('renders empty state when no videos returned', async () => {
    mockGetVideos.mockResolvedValueOnce([]);

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('count').props.children).toBe(0);
    });
  });

  it('handles load error gracefully', async () => {
    mockGetVideos.mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('count').props.children).toBe(0);
    });
  });
});

describe('addVideo()', () => {
  it('prepends the new video to the list', async () => {
    mockGetVideos.mockResolvedValueOnce(sampleVideos);
    const newVideo = { id: 'v3', title: 'New Video', description: 'D', youtubeId: 'yt3', dateAdded: '2024-02-01' };
    mockAddVideo.mockResolvedValueOnce(newVideo);

    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await act(async () => {
      getByTestId('add-video').props.onPress();
    });

    expect(getByTestId('count').props.children).toBe(3);
    expect(getByTestId('first-title').props.children).toBe('New Video');
  });

  it('throws when service fails', async () => {
    mockGetVideos.mockResolvedValueOnce([]);
    mockAddVideo.mockRejectedValueOnce(new Error('Write failed'));

    let addFn: (v: any) => Promise<void>;
    function CaptureContext() {
      addFn = useVideos().addVideo;
      return null;
    }

    render(
      <VideosProvider>
        <CaptureContext />
      </VideosProvider>
    );

    await waitFor(() => {});

    await expect(act(async () => { await addFn!({ title: 'T', description: 'D', youtubeId: 'yt1' }); }))
      .rejects.toThrow('Write failed');
  });
});

describe('refreshVideos()', () => {
  it('re-fetches videos from service', async () => {
    mockGetVideos.mockResolvedValueOnce(sampleVideos);

    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const updatedVideos = [...sampleVideos, { id: 'v3', title: 'Refreshed', description: 'D', youtubeId: 'yt3', dateAdded: '2024-02-01' }];
    mockGetVideos.mockResolvedValueOnce(updatedVideos);

    await act(async () => {
      getByTestId('refresh').props.onPress();
    });

    await waitFor(() => {
      expect(mockGetVideos).toHaveBeenCalledTimes(2);
      expect(getByTestId('count').props.children).toBe(3);
    });
  });
});

describe('useVideos()', () => {
  it('throws when used outside VideosProvider', () => {
    function ComponentWithoutProvider() {
      useVideos();
      return null;
    }

    expect(() => render(<ComponentWithoutProvider />)).toThrow(
      'useVideos must be used within a VideosProvider'
    );
  });
});
