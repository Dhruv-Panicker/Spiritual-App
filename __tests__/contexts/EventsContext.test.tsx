/**
 * Tests for EventsContext / EventsProvider
 *
 * Tests cover:
 * - Loads events on mount
 * - getCurrentMonthEvents filters correctly
 * - monthlyData organizes events into 12 month buckets
 * - getEventTypeColor returns correct hex per type
 * - getEventTypeBadgeStyle returns { backgroundColor, color: '#FFFFFF' }
 * - addEvent() prepends to state
 * - refreshEvents() re-fetches
 * - useEvents() throws outside provider
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
    getEvents: jest.fn(),
    addEvent: jest.fn(),
  },
}));

import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import { EventsProvider, useEvents } from '@/contexts/EventsContext';
import { googleSheetsService } from '@/services/googleSheetsService';
import type { Event } from '@/services/googleSheetsService';

const mockGetEvents = googleSheetsService.getEvents as jest.Mock;
const mockAddEvent = googleSheetsService.addEvent as jest.Mock;

// Build dates with the current month for "getCurrentMonthEvents" tests
const now = new Date();
const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`;
const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 10);
const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-10`;

const currentMonthEvent: Event = {
  id: 'e1',
  title: 'Current Month Event',
  date: currentMonthStr,
  time: '8:00 AM',
  description: 'Happening now',
  type: 'meditation',
};

const nextMonthEvent: Event = {
  id: 'e2',
  title: 'Next Month Event',
  date: nextMonthStr,
  time: '9:00 AM',
  description: 'Coming up',
  type: 'teaching',
};

function EventsTestComponent() {
  const { events, loading, getCurrentMonthEvents, monthlyData, getEventTypeColor, getEventTypeBadgeStyle, addEvent, refreshEvents } = useEvents();
  const currentColor = getEventTypeColor('meditation');
  const badge = getEventTypeBadgeStyle('celebration');
  return (
    <>
      <Text testID="loading">{loading ? 'loading' : 'ready'}</Text>
      <Text testID="count">{events.length}</Text>
      <Text testID="current-month-count">{getCurrentMonthEvents.length}</Text>
      <Text testID="monthly-data-length">{monthlyData.length}</Text>
      <Text testID="meditation-color">{currentColor}</Text>
      <Text testID="badge-color">{badge.color}</Text>
      <Text testID="badge-bg">{badge.backgroundColor}</Text>
      <Text testID="add-event" onPress={() => addEvent({ title: 'New', date: currentMonthStr, time: '10:00', description: 'D', type: 'retreat' })} />
      <Text testID="refresh" onPress={() => refreshEvents()} />
    </>
  );
}

function renderWithProvider() {
  return render(
    <EventsProvider>
      <EventsTestComponent />
    </EventsProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EventsProvider', () => {
  it('starts loading and fetches events on mount', async () => {
    mockGetEvents.mockResolvedValueOnce([currentMonthEvent, nextMonthEvent]);

    const { getByTestId } = renderWithProvider();

    expect(getByTestId('loading').props.children).toBe('loading');

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('count').props.children).toBe(2);
    });
  });

  it('handles load error gracefully', async () => {
    mockGetEvents.mockRejectedValueOnce(new Error('Fetch failed'));

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('count').props.children).toBe(0);
    });
  });
});

describe('getCurrentMonthEvents', () => {
  it('returns only events in the current month', async () => {
    mockGetEvents.mockResolvedValueOnce([currentMonthEvent, nextMonthEvent]);

    const { getByTestId } = renderWithProvider();

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    expect(getByTestId('current-month-count').props.children).toBe(1);
  });

  it('returns empty array when there are no current-month events', async () => {
    mockGetEvents.mockResolvedValueOnce([nextMonthEvent]);

    const { getByTestId } = renderWithProvider();

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    expect(getByTestId('current-month-count').props.children).toBe(0);
  });
});

describe('monthlyData', () => {
  it('always returns exactly 12 month buckets', async () => {
    mockGetEvents.mockResolvedValueOnce([]);

    const { getByTestId } = renderWithProvider();

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    expect(getByTestId('monthly-data-length').props.children).toBe(12);
  });

  it('places events into the correct month bucket', async () => {
    mockGetEvents.mockResolvedValueOnce([currentMonthEvent, nextMonthEvent]);

    let monthlyDataValue: any[];
    function CaptureContext() {
      monthlyDataValue = useEvents().monthlyData;
      return null;
    }

    render(
      <EventsProvider>
        <CaptureContext />
      </EventsProvider>
    );

    await waitFor(() => {
      const currentMonthIndex = now.getMonth();
      expect(monthlyDataValue[currentMonthIndex].events).toHaveLength(1);
      expect(monthlyDataValue[currentMonthIndex].events[0].id).toBe('e1');
    });
  });
});

describe('getEventTypeColor()', () => {
  it('returns a non-empty hex string for "meditation"', async () => {
    mockGetEvents.mockResolvedValueOnce([]);

    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const color = getByTestId('meditation-color').props.children;
    expect(color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });
});

describe('getEventTypeBadgeStyle()', () => {
  it('returns white text color for badge', async () => {
    mockGetEvents.mockResolvedValueOnce([]);

    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    expect(getByTestId('badge-color').props.children).toBe('#FFFFFF');
  });

  it('returns a non-empty backgroundColor for badge', async () => {
    mockGetEvents.mockResolvedValueOnce([]);

    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const bg = getByTestId('badge-bg').props.children;
    expect(bg).toBeTruthy();
  });
});

describe('addEvent()', () => {
  it('prepends the new event to the list', async () => {
    mockGetEvents.mockResolvedValueOnce([currentMonthEvent]);
    const newEvent: Event = { id: 'e-new', title: 'New Event', date: currentMonthStr, time: '10:00', description: 'D', type: 'retreat' };
    mockAddEvent.mockResolvedValueOnce(newEvent);

    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await act(async () => {
      getByTestId('add-event').props.onPress();
    });

    expect(getByTestId('count').props.children).toBe(2);
  });

  it('throws when service fails', async () => {
    mockGetEvents.mockResolvedValueOnce([]);
    mockAddEvent.mockRejectedValueOnce(new Error('Write failed'));

    let addFn: (e: any) => Promise<void>;
    function CaptureContext() {
      addFn = useEvents().addEvent;
      return null;
    }

    render(
      <EventsProvider>
        <CaptureContext />
      </EventsProvider>
    );

    await waitFor(() => {});

    await expect(
      act(async () => { await addFn!({ title: 'T', date: '2024-01-01', time: '9:00', description: 'D', type: 'meditation' }); })
    ).rejects.toThrow('Write failed');
  });
});

describe('refreshEvents()', () => {
  it('re-fetches events from service', async () => {
    mockGetEvents.mockResolvedValueOnce([currentMonthEvent]);

    const { getByTestId } = renderWithProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    mockGetEvents.mockResolvedValueOnce([currentMonthEvent, nextMonthEvent]);

    await act(async () => {
      getByTestId('refresh').props.onPress();
    });

    await waitFor(() => {
      expect(mockGetEvents).toHaveBeenCalledTimes(2);
      expect(getByTestId('count').props.children).toBe(2);
    });
  });
});

describe('useEvents()', () => {
  it('throws when used outside EventsProvider', () => {
    function ComponentWithoutProvider() {
      useEvents();
      return null;
    }

    expect(() => render(<ComponentWithoutProvider />)).toThrow(
      'useEvents must be used within an EventsProvider'
    );
  });
});
