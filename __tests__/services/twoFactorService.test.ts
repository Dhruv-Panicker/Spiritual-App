/**
 * Unit tests for twoFactorService (Supabase email OTP)
 *
 * Tests cover:
 * - Email validation before sending code
 * - Code length validation before verifying
 * - Success paths for sendVerificationCode and verifyCode
 * - shouldCreateUser passthrough and userNotFound detection
 * - Friendly error mapping (no account, rate limit, bad code)
 * - Network failure handling
 */

jest.mock('@/services/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
    },
  },
}));

import { sendVerificationCode, verifyCode, twoFactorService } from '@/services/twoFactorService';
import { supabase } from '@/services/supabaseClient';

const mockSignInWithOtp = supabase.auth.signInWithOtp as jest.Mock;
const mockVerifyOtp = supabase.auth.verifyOtp as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });
  mockVerifyOtp.mockResolvedValue({
    data: { session: { access_token: 'token' }, user: { id: 'uid-1' } },
    error: null,
  });
});

// ─── Constants ────────────────────────────────────────────────────────────────

describe('service constants', () => {
  it('exports CODE_LENGTH as 6', () => {
    expect(twoFactorService.CODE_LENGTH).toBe(6);
  });

  it('exports RETRY_COOLDOWN_SECONDS as 60 (Supabase send interval)', () => {
    expect(twoFactorService.RETRY_COOLDOWN_SECONDS).toBe(60);
  });
});

// ─── sendVerificationCode ─────────────────────────────────────────────────────

describe('sendVerificationCode()', () => {
  it('returns error for empty email', async () => {
    const result = await sendVerificationCode('');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email address');
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it('returns error for email without @ symbol', async () => {
    const result = await sendVerificationCode('notanemail');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email address');
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it('normalizes email to lowercase before sending', async () => {
    await sendVerificationCode('USER@EXAMPLE.COM');

    expect(mockSignInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@example.com' })
    );
  });

  it('creates accounts by default (sign-up flow)', async () => {
    await sendVerificationCode('user@example.com');

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'user@example.com',
      options: { shouldCreateUser: true },
    });
  });

  it('passes shouldCreateUser: false through (login flow)', async () => {
    await sendVerificationCode('user@example.com', { shouldCreateUser: false });

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'user@example.com',
      options: { shouldCreateUser: false },
    });
  });

  it('returns { success: true } on success', async () => {
    const result = await sendVerificationCode('user@example.com');

    expect(result).toEqual({ success: true });
  });

  it('flags userNotFound when Supabase rejects unknown email on login', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({
      data: {},
      error: { message: 'Signups not allowed for otp' },
    });

    const result = await sendVerificationCode('unknown@example.com', { shouldCreateUser: false });

    expect(result.success).toBe(false);
    expect(result.userNotFound).toBe(true);
    expect(result.error).toBe('No account found for this email.');
  });

  it('maps rate-limit errors to a friendly message', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({
      data: {},
      error: { message: 'email rate limit exceeded' },
    });

    const result = await sendVerificationCode('user@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Too many attempts. Please wait a minute and try again.');
    expect(result.userNotFound).toBeFalsy();
  });

  it('returns error on network failure', async () => {
    mockSignInWithOtp.mockRejectedValueOnce(new Error('Network is down'));

    const result = await sendVerificationCode('user@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network is down');
  });
});

// ─── verifyCode ───────────────────────────────────────────────────────────────

describe('verifyCode()', () => {
  it('returns error for empty email', async () => {
    const result = await verifyCode('', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email address');
    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });

  it('returns error for email without @', async () => {
    const result = await verifyCode('notanemail', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email address');
  });

  it('returns error for code shorter than 6 digits', async () => {
    const result = await verifyCode('user@example.com', '12345');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Please enter a 6-digit code');
    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });

  it('strips non-digit characters from code before checking length', async () => {
    // Letters stripped leaves '123' (only 3 digits) → error
    const result = await verifyCode('user@example.com', '1a2b3c');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Please enter a 6-digit code');
  });

  it('verifies with digits only and type email', async () => {
    await verifyCode('user@example.com', '123456');

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      email: 'user@example.com',
      token: '123456',
      type: 'email',
    });
  });

  it('normalizes email to lowercase', async () => {
    await verifyCode('USER@EXAMPLE.COM', '123456');

    expect(mockVerifyOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@example.com' })
    );
  });

  it('returns { success: true } when a session is created', async () => {
    const result = await verifyCode('user@example.com', '123456');

    expect(result).toEqual({ success: true });
  });

  it('maps invalid/expired token errors to a friendly message', async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: 'Token has expired or is invalid' },
    });

    const result = await verifyCode('user@example.com', '000000');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid or expired code. Please try again.');
  });

  it('fails when no session is returned even without an error', async () => {
    mockVerifyOtp.mockResolvedValueOnce({ data: { session: null, user: null }, error: null });

    const result = await verifyCode('user@example.com', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid or expired code. Please try again.');
  });

  it('returns error on network failure', async () => {
    mockVerifyOtp.mockRejectedValueOnce(new Error('Connection refused'));

    const result = await verifyCode('user@example.com', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection refused');
  });
});
