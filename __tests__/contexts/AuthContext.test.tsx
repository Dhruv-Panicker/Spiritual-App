/**
 * Integration tests for AuthContext / AuthProvider (Supabase auth)
 *
 * Tests cover:
 * - Initial loading state
 * - Session restoration from Supabase session + cached profile
 * - login(): sends OTP, UNVERIFIED_USER, invalid email
 * - completeLogin(): loads profile, admin detection from is_admin
 * - completeSignUp(): creates profile row, derives display name
 * - logout(): signs out and clears storage
 * - useAuth() throws when used outside provider
 */

jest.mock('@/config/env', () => ({
  env: {
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-anon-key',
    googleSheetsApiKey: 'test-key',
    googleSheetId: 'test-sheet',
    googleAppsScriptWebhookUrl: 'https://script.google.com/test',
    adminEmails: [],
    prayerRecipientEmail: 'prayer@example.com',
    appName: 'Test App',
    appStoreLink: 'https://apps.apple.com/test',
    playStoreLink: 'https://play.google.com/test',
    webAppLink: 'https://test.app',
  },
  validateEnv: jest.fn(),
}));

jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('@/services/twoFactorService', () => ({
  twoFactorService: {
    sendVerificationCode: jest.fn(),
    verifyCode: jest.fn(),
    CODE_LENGTH: 6,
    RETRY_COOLDOWN_SECONDS: 60,
  },
}));

jest.mock('@/services/googleSheetsService', () => ({
  googleSheetsService: {
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
import { supabase } from '@/services/supabaseClient';
import { twoFactorService } from '@/services/twoFactorService';

const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockGetUser = supabase.auth.getUser as jest.Mock;
const mockSignOut = supabase.auth.signOut as jest.Mock;
const mockFrom = supabase.from as jest.Mock;
const mockSendCode = twoFactorService.sendVerificationCode as jest.Mock;
const mockAsyncGet = AsyncStorage.getItem as jest.Mock;
const mockAsyncSet = AsyncStorage.setItem as jest.Mock;
const mockAsyncRemove = AsyncStorage.removeItem as jest.Mock;

/** Mock the users-table query chain: select().eq().maybeSingle() and insert(). */
function mockUsersTable(options: {
  row?: object | null;
  selectError?: object | null;
  insertError?: (object & { code?: string }) | null;
} = {}) {
  const { row = null, selectError = null, insertError = null } = options;
  const maybeSingle = jest.fn(() => Promise.resolve({ data: row, error: selectError }));
  const eq = jest.fn(() => ({ maybeSingle }));
  const select = jest.fn(() => ({ eq }));
  const insert = jest.fn(() => Promise.resolve({ error: insertError }));
  mockFrom.mockReturnValue({ select, insert });
  return { select, eq, maybeSingle, insert };
}

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
    completeLogin?: (email: string) => Promise<void>;
  } = {};

  function CaptureContext() {
    const auth = useAuth();
    ref.login = auth.login;
    ref.logout = auth.logout;
    ref.completeSignUp = auth.completeSignUp;
    ref.completeLogin = auth.completeLogin;
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
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockGetUser.mockResolvedValue({ data: { user: { id: 'uid-1', email: 'user@example.com' } } });
  mockSignOut.mockResolvedValue({ error: null });
  mockSendCode.mockResolvedValue({ success: true });
  mockUsersTable();
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
  it('restores cached user when a Supabase session exists', async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'uid-1', email: 'restored@example.com' } } },
    });
    const storedUser = {
      id: 'uid-1',
      name: 'Restored User',
      email: 'restored@example.com',
      isAdmin: false,
    };
    mockAsyncGet.mockResolvedValueOnce(JSON.stringify(storedUser));

    const { getByTestId } = setupProvider();

    await waitFor(() =>
      expect(getByTestId('user-email').props.children).toBe('restored@example.com')
    );
    expect(getByTestId('user-name').props.children).toBe('Restored User');
  });

  it('stays logged out and clears stale cache when there is no Supabase session', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });

    const { getByTestId } = setupProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
      expect(getByTestId('user-email').props.children).toBe('no-user');
    });
    expect(mockAsyncRemove).toHaveBeenCalledWith('spiritual-app-user');
  });

  it('fetches the profile when a session exists but no cache does', async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'uid-1', email: 'fresh@example.com' } } },
    });
    mockAsyncGet.mockResolvedValueOnce(null);
    mockUsersTable({
      row: { id: 'uid-1', name: 'Fresh User', email: 'fresh@example.com', is_admin: false },
    });

    const { getByTestId } = setupProvider();

    await waitFor(() =>
      expect(getByTestId('user-email').props.children).toBe('fresh@example.com')
    );
    expect(mockAsyncSet).toHaveBeenCalledWith(
      'spiritual-app-user',
      expect.stringContaining('fresh@example.com')
    );
  });

  it('handles corrupt cached data gracefully', async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'uid-1', email: 'user@example.com' } } },
    });
    mockAsyncGet.mockResolvedValueOnce('invalid-json{{');

    const { getByTestId } = setupProvider();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('ready');
    });
    // No crash; user stays logged out until profile can be loaded
    expect(getByTestId('user-email').props.children).toBe('no-user');
  });
});

// ─── login() — sends the OTP code ─────────────────────────────────────────────

describe('login()', () => {
  it('sends a login code without creating an account', async () => {
    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.login!('dhruv@example.com'));

    expect(error).toBeNull();
    expect(mockSendCode).toHaveBeenCalledWith('dhruv@example.com', { shouldCreateUser: false });
    // Not logged in yet — code still needs to be verified
    expect(getByTestId('user-email').props.children).toBe('no-user');
  });

  it('normalizes email to lowercase', async () => {
    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await tryCallFn(() => ref.login!('TEST@EXAMPLE.COM'));

    expect(mockSendCode).toHaveBeenCalledWith('test@example.com', { shouldCreateUser: false });
  });

  it('throws UNVERIFIED_USER when the email has no account', async () => {
    mockSendCode.mockResolvedValueOnce({
      success: false,
      userNotFound: true,
      error: 'No account found for this email.',
    });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.login!('unknown@example.com'));

    expect(error).not.toBeNull();
    expect(error!.message).toBe('UNVERIFIED_USER');
    expect(getByTestId('user-email').props.children).toBe('no-user');
  });

  it('throws the service error for non-userNotFound failures', async () => {
    mockSendCode.mockResolvedValueOnce({
      success: false,
      error: 'Too many attempts. Please wait a minute and try again.',
    });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.login!('user@example.com'));

    expect(error).not.toBeNull();
    expect(error!.message).toContain('Too many attempts');
  });

  it('throws for invalid email format without calling the service', async () => {
    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.login!('notanemail'));

    expect(error).not.toBeNull();
    expect(error!.message).toContain('valid email');
    expect(mockSendCode).not.toHaveBeenCalled();
  });
});

// ─── completeLogin() — after OTP verification ─────────────────────────────────

describe('completeLogin()', () => {
  it('loads the profile row and sets the user', async () => {
    mockUsersTable({
      row: { id: 'uid-1', name: 'Dhruv Panicker', email: 'dhruv@example.com', is_admin: false },
    });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.completeLogin!('dhruv@example.com'));

    expect(error).toBeNull();
    expect(getByTestId('user-email').props.children).toBe('dhruv@example.com');
    expect(getByTestId('user-name').props.children).toBe('Dhruv Panicker');
    expect(getByTestId('is-admin').props.children).toBe('not-admin');
  });

  it('detects admin status from the is_admin column', async () => {
    mockUsersTable({
      row: { id: 'uid-2', name: 'Admin User', email: 'admin@example.com', is_admin: true },
    });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await tryCallFn(() => ref.completeLogin!('admin@example.com'));

    expect(getByTestId('is-admin').props.children).toBe('admin');
  });

  it('creates a profile row when one is missing (account predates profiles)', async () => {
    const { insert } = mockUsersTable({ row: null });
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'uid-9', email: 'old.user@example.com' } },
    });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.completeLogin!('old.user@example.com'));

    expect(error).toBeNull();
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'uid-9', email: 'old.user@example.com' })
    );
    expect(getByTestId('user-email').props.children).toBe('old.user@example.com');
  });

  it('persists the profile to AsyncStorage', async () => {
    mockUsersTable({
      row: { id: 'uid-1', name: 'User Name', email: 'user@example.com', is_admin: false },
    });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await tryCallFn(() => ref.completeLogin!('user@example.com'));

    expect(mockAsyncSet).toHaveBeenCalledWith(
      'spiritual-app-user',
      expect.stringContaining('user@example.com')
    );
  });
});

// ─── completeSignUp() ─────────────────────────────────────────────────────────

describe('completeSignUp()', () => {
  it('creates the profile row and sets the user', async () => {
    const { insert } = mockUsersTable({ row: null });
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'uid-3', email: 'new@example.com' } },
    });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.completeSignUp!('new@example.com', 'New User'));

    expect(error).toBeNull();
    expect(getByTestId('user-email').props.children).toBe('new@example.com');
    expect(insert).toHaveBeenCalledWith({ id: 'uid-3', email: 'new@example.com', name: 'New User' });
  });

  it('keeps the existing profile name when the row already exists', async () => {
    mockUsersTable({
      row: { id: 'uid-1', name: 'Original Name', email: 'existing@example.com', is_admin: false },
    });

    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    await tryCallFn(() => ref.completeSignUp!('existing@example.com', 'Different Name'));

    expect(getByTestId('user-name').props.children).toBe('Original Name');
  });

  it('throws for invalid email', async () => {
    const { getByTestId, ref } = setupProvider();
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

    const error = await tryCallFn(() => ref.completeSignUp!('bademail', 'Name'));

    expect(error).not.toBeNull();
    expect(error!.message).toContain('Invalid email');
  });

  it('derives display name from email when name is empty', async () => {
    mockUsersTable({ row: null });
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'uid-4', email: 'john.doe@example.com' } },
    });

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
  it('signs out of Supabase, clears user state and storage', async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'uid-1', email: 'user@example.com' } } },
    });
    const storedUser = {
      id: 'uid-1',
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
    expect(mockSignOut).toHaveBeenCalled();
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
