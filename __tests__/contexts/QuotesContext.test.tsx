/**
 * Tests for QuotesContext / QuotesProvider
 *
 * Tests cover:
 * - Loads quotes on mount
 * - addQuote() prepends and propagates to state
 * - refreshQuotes() re-fetches data
 * - Error handling during load
 * - useQuotes() throws when used outside provider
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
    getQuotes: jest.fn(),
    addQuote: jest.fn(),
  },
}));

import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import { QuotesProvider, useQuotes } from '@/contexts/QuotesContext';
import { googleSheetsService } from '@/services/googleSheetsService';

const mockGetQuotes = googleSheetsService.getQuotes as jest.Mock;
const mockAddQuote = googleSheetsService.addQuote as jest.Mock;

const sampleQuotes = [
  { id: 'q1', text: 'Peace within', author: 'Siddhguru', category: 'Wisdom', dateAdded: '2024-01-01' },
  { id: 'q2', text: 'Love the path', author: 'Siddhguru', category: 'Love', dateAdded: '2024-01-02' },
];

function QuotesTestComponent() {
  const { quotes, loading, addQuote, refreshQuotes } = useQuotes();
  return (
    <>
      <Text testID="loading">{loading ? 'loading' : 'ready'}</Text>
      <Text testID="count">{quotes.length}</Text>
      <Text testID="first-quote">{quotes[0]?.text ?? ''}</Text>
      <Text testID="add-quote" onPress={() => addQuote({ text: 'New', author: 'A', category: 'B' })} />
      <Text testID="refresh" onPress={() => refreshQuotes()} />
    </>
  );
}

function renderWithProvider() {
  return render(
    <QuotesProvider>
      <QuotesTestComponent />
    </QuotesProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('QuotesProvider', () => {
  it('starts in loading state and loads quotes on mount', async () => {
    mockGetQuotes.mockResolvedValueOnce(sampleQuotes);

    const { getByTestId } = renderWithProvider();

    expect(getByTestId('loading').props.children).toBe('loading');

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('count').props.children).toBe(2);
    });
  });

  it('calls getQuotes once on mount', async () => {
    mockGetQuotes.mockResolvedValueOnce([]);

    renderWithProvider();

    await waitFor(() => {
      expect(mockGetQuotes).toHaveBeenCalledTimes(1);
    });
  });

  it('renders empty state when no quotes are returned', async () => {
    mockGetQuotes.mockResolvedValueOnce([]);

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('count').props.children).toBe(0);
    });
  });

  it('handles load error gracefully (still transitions to ready)', async () => {
    mockGetQuotes.mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('count').props.children).toBe(0);
    });
  });
});

describe('addQuote()', () => {
  it('prepends the new quote to the list', async () => {
    mockGetQuotes.mockResolvedValueOnce(sampleQuotes);
    const newQuote = { id: 'q3', text: 'New quote', author: 'A', category: 'B', dateAdded: '2024-02-01' };
    mockAddQuote.mockResolvedValueOnce(newQuote);

    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await act(async () => {
      getByTestId('add-quote').props.onPress();
    });

    expect(getByTestId('count').props.children).toBe(3);
    expect(getByTestId('first-quote').props.children).toBe('New quote');
  });

  it('throws when service fails', async () => {
    mockGetQuotes.mockResolvedValueOnce([]);
    mockAddQuote.mockRejectedValueOnce(new Error('Write failed'));

    let addFn: (q: any) => Promise<void>;
    function CaptureContext() {
      addFn = useQuotes().addQuote;
      return null;
    }

    render(
      <QuotesProvider>
        <CaptureContext />
      </QuotesProvider>
    );

    await waitFor(() => {});

    await expect(act(async () => { await addFn!({ text: 'x', author: 'y', category: 'z' }); }))
      .rejects.toThrow('Write failed');
  });
});

describe('refreshQuotes()', () => {
  it('re-fetches quotes from the service', async () => {
    mockGetQuotes.mockResolvedValueOnce(sampleQuotes);

    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const updatedQuotes = [...sampleQuotes, { id: 'q3', text: 'Refreshed', author: 'A', category: 'B', dateAdded: '2024-02-01' }];
    mockGetQuotes.mockResolvedValueOnce(updatedQuotes);

    await act(async () => {
      getByTestId('refresh').props.onPress();
    });

    await waitFor(() => {
      expect(mockGetQuotes).toHaveBeenCalledTimes(2);
      expect(getByTestId('count').props.children).toBe(3);
    });
  });
});

describe('useQuotes()', () => {
  it('throws when used outside QuotesProvider', () => {
    function ComponentWithoutProvider() {
      useQuotes();
      return null;
    }

    expect(() => render(<ComponentWithoutProvider />)).toThrow(
      'useQuotes must be used within a QuotesProvider'
    );
  });
});
