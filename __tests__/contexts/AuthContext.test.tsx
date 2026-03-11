/**
 * Integration tests for AuthContext / AuthProvider
 *
 * Tests cover:
 * - Initial loading state
 * - Session restoration from AsyncStorage
 * - login(): success, UNVERIFIED_USER, invalid email
 * - completeSignUp(): sets user, calls addToUserbase
 * - logout(): clears user and storage
 * - useAuth() throws when used outside provider
 * - Admin role detection by email
 */

jest.mock('@/config/env', () => ({
  env: {
    googleSheetsApiKey: 'test-key',
    googleSheetId: 'test-sheet',
    googleAppsScriptWebhookUrl: 'https://script.google.com/test',
    adminEmails: ['admin@example.com'],
    prayerRecipientEmail: 'prayer@example.com',
    appName: 'Test App',
    appStoreLink: 'https://apps.apple.com/test',
    playStoreLink: 'https://play.google.com/test',
    webAppLink: 'https://test.app',
  },
  validateEnv: jest.fn(),
}));

jest.mock('@/services/googleSheetsService', () => ({
  googleSheetsService: {
    checkUserInUserbase: jest.fn(),
    addToUserbase: jest.fn(),
    logUserLogin: jest.fn(() => Promise.resolve(true)),
    savePushToken: jest.fn(() => Promise.resolve(true)),
  },
}));

jest.mock('@/services/notificationService', () => ({
  notificationService: {
    initialize: jest.fn(() => Promise.resolve()),
    getPushToken: jest.fn(() => null),
    getStoredPushToken: jest.fn(() => Promise.resolve(null)),
  },
}));

import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { googleSheetsService } from '@/services/googleSheetsService';

const mockCheckUser = googleSheetsService.checkUserInUserbase as jest.Mock;
const mockAddToUserbase = googleSheetsService.addToUserbase as jest.Mock;
const mockAsyncGet = AsyncStorage.getItem as jest.Mock;
const mockAsyncSet = AsyncStorage.setItem as jest.Mock;
const mockAsyncRemove = AsyncStorage.removeItem as jest.Mock;

// ─── Helper: render a provider that exposes context state via text testIDs ────

function StatusDisplay() {
  const { user, isLoading } = useAuth();
  return (
    <>
      <Text testID="loading">{isLoading ? 'loading' : 'ready'}</Text>
      <Text testID="user-email">{user?.email ?? 'no-user'}</Text>
      <Text testID="user-name">{user?.name ?? ''}</Text>
      <Text testID="is-admin">{user?.isAdmin ? 'admin' : 'not-admin'}</Text>
    </>
  );
}

// Renders provider + a component that captures auth functions in a ref
function setupProvider() {
  const ref: {
    login?: (email: string) => Promise<void>;
    logout?: () => Promise<void>;
    completeSignUp?: (email: string, name: string) => Promise<void>;
  } = {};

  function CaptureContext() {
    const auth = useAuth();
    ref.login = auth.login;
    ref.logout = auth.logout;
    ref.completeSignUp = auth.completeSignUp;
    return null;
  }

  const result = render(
    <AuthProvider>
      <CaptureContext />
      <StatusDisplay />
    </AuthProvider>
  );

  return { ...result, ref };
}

// Helper: call an auth fn and capture any thrown error
async function tryCallFn(fn: () => Promise<void>): Promise<Error | null> {
  let error: Error | null = null;
  await act(async () => {
    try {
      await fn();
    } catch (e) {
      error = e as Error;
    }
  });
  return error;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockAsyncGet.mockResolvedValue(null);
  mockAsyncSet.mockResolvedValue(undefined);
  mockAsyncRemove.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
});

// ─── Initial state ────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('starts in loading state with no user', async () => {
    const { getByTestId } = setupProvider();

    // Immediately after render, should be loading
    expect(getByTestId('loading').props.children).toBe('loading');
    expect(getByTestId('user-email').props.children).toBe('no-user');

    await waitFor(() =>
      expect(getByTestId('loading').props.children).toBe('ready')
    );
  });
});

// ─── Session restoration ──────────────────────────────────────────────────────

describe('session restoration', () => {
  it('restores user from AsyncStorage on mount', async () => {
    const storedUser = {
      id: 'restored@example.com',
      name: 'Restored User',
      email: 'restored@example.com',
      isAdmin: false,
    };
    mockAsyncGet.mockResolvedValueOnce(JSON.stringify(storedUser));

    const { getByTestId } = setupProvider();

    await waitFor(() =>
      expect(getByTestId('user-email').props.children).toBe('restored@example.com')
    );
  });

  it('stays with no user when AsyncStorage is empty', async () => {
    mockAsyncGet.mockResolvedValueOnce(null);

    const { getByTestId } = setupProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('user-email').props.children).toBe('no-user');
    });
  });

  it('handles corrupt AsyncStorage data gracefully', async () => {
    mockAsyncGet.mockResolvedValueOnce('invalid-json{{');

    const { getByTestId } = setupProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('user-email').props.children).toBe('no-user');
    });
  });
});

// ─── login() ──────────────────────────────────────────────────────────────────

describe('login()', () => {
  it('sets user on successful login', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: true, name: 'Dhruv Panicker' });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.login!('dhruv@example.com'));

    expect(error).toBeNull();
    expect(getByTestId('user-email').props.children).toBe('dhruv@example.com');
    expect(getByTestId('user-name').props.children).toBe('Dhruv Panicker');
  });

  it('detects admin status for admin email', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: true, name: 'Admin User' });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await tryCallFn(() => ref.login!('admin@example.com'));

    expect(getByTestId('is-admin').props.children).toBe('admin');
  });

  it('non-admin email sets isAdmin to false', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: true, name: 'Regular User' });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await tryCallFn(() => ref.login!('regular@example.com'));

    expect(getByTestId('is-admin').props.children).toBe('not-admin');
  });

  it('throws UNVERIFIED_USER when user is not in userbase', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: false });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.login!('unknown@example.com'));

    expect(error).not.toBeNull();
    expect(error!.message).toBe('UNVERIFIED_USER');
    expect(getByTestId('user-email').props.children).toBe('no-user');
  });

  it('throws for invalid email format', async () => {
    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.login!('notanemail'));

    expect(error).not.toBeNull();
    expect(error!.message).toContain('valid email');
  });

  it('normalizes email to lowercase', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: true, name: 'Test User' });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await tryCallFn(() => ref.login!('TEST@EXAMPLE.COM'));

    expect(getByTestId('user-email').props.children).toBe('test@example.com');
  });

  it('persists user object to AsyncStorage after login', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: true, name: 'User Name' });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await tryCallFn(() => ref.login!('user@example.com'));

    expect(mockAsyncSet).toHaveBeenCalledWith(
      'spiritual-app-user',
      expect.stringContaining('user@example.com')
    );
  });
});

// ─── completeSignUp() ─────────────────────────────────────────────────────────

describe('completeSignUp()', () => {
  it('sets user and calls addToUserbase on success', async () => {
    mockAddToUserbase.mockResolvedValueOnce(true);

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.completeSignUp!('new@example.com', 'New User'));

    expect(error).toBeNull();
    expect(getByTestId('user-email').props.children).toBe('new@example.com');
    expect(mockAddToUserbase).toHaveBeenCalledWith('new@example.com', 'New User');
  });

  it('throws for invalid email', async () => {
    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.completeSignUp!('bademail', 'Name'));

    expect(error).not.toBeNull();
    expect(error!.message).toContain('Invalid email');
  });

  it('derives display name from email when name is empty', async () => {
    mockAddToUserbase.mockResolvedValueOnce(true);

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await tryCallFn(() => ref.completeSignUp!('john.doe@example.com', ''));

    const name = getByTestId('user-name').props.children;
    expect(name).toBeTruthy();
    // Dots replaced with spaces: "john doe"
    expect(name.toLowerCase()).toContain('john');
  });
});

// ─── logout() ─────────────────────────────────────────────────────────────────

describe('logout()', () => {
  it('clears user state and removes from AsyncStorage', async () => {
    const storedUser = {
      id: 'user@example.com',
      name: 'User',
      email: 'user@example.com',
      isAdmin: false,
    };
    mockAsyncGet.mockResolvedValueOnce(JSON.stringify(storedUser));

    const { getByTestId, ref } = setupProvider();
    await waitFor(() =>
      expect(getByTestId('user-email').props.children).toBe('user@example.com')
    );

    await act(async () => {
      await ref.logout!();
    });

    expect(getByTestId('user-email').props.children).toBe('no-user');
    expect(mockAsyncRemove).toHaveBeenCalledWith('spiritual-app-user');
  });
});

// ─── useAuth outside provider ─────────────────────────────────────────────────

describe('useAuth()', () => {
  it('throws when used outside AuthProvider', () => {
    function ComponentWithoutProvider() {
      useAuth();
      return null;
    }

    expect(() => render(<ComponentWithoutProvider />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });
});
