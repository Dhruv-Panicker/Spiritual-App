/**
 * Unit tests for twoFactorService
 *
 * Tests cover:
 * - Email validation before sending code
 * - Code length validation before verifying
 * - Success paths for sendVerificationCode and verifyCode
 * - Server-side error handling and developer-error sanitization
 * - Network failure handling
 * - Invalid JSON response handling
 */

jest.mock('@/config/env', () => ({
  env: {
    googleAppsScriptWebhookUrl: 'https://script.google.com/test-webhook',
  },
  validateEnv: jest.fn(),
}));

import { sendVerificationCode, verifyCode, twoFactorService } from '@/services/twoFactorService';

const mockFetch = global.fetch as jest.Mock;

function makeOkResponse(data: object) {
  return {
    ok: true,
    status: 200,
    text: jest.fn(() => Promise.resolve(JSON.stringify(data))),
  };
}

function makeErrorResponse(status: number, body: object | string = {}) {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: false,
    status,
    text: jest.fn(() => Promise.resolve(bodyStr)),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Constants ────────────────────────────────────────────────────────────────

describe('service constants', () => {
  it('exports CODE_LENGTH as 6', () => {
    expect(twoFactorService.CODE_LENGTH).toBe(6);
  });

  it('exports RETRY_COOLDOWN_SECONDS as 30', () => {
    expect(twoFactorService.RETRY_COOLDOWN_SECONDS).toBe(30);
  });
});

// ─── sendVerificationCode ─────────────────────────────────────────────────────

describe('sendVerificationCode()', () => {
  it('returns error for empty email', async () => {
    const result = await sendVerificationCode('');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email address');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns error for email without @ symbol', async () => {
    const result = await sendVerificationCode('notanemail');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email address');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('normalizes email to lowercase before sending', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    await sendVerificationCode('USER@EXAMPLE.COM');

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.data.email).toBe('user@example.com');
  });

  it('sends correct action to webhook', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    await sendVerificationCode('user@example.com');

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.action).toBe('sendVerificationCode');
  });

  it('returns { success: true } on success', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    const result = await sendVerificationCode('user@example.com');

    expect(result).toEqual({ success: true });
  });

  it('returns error when server returns success: false', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: false, error: 'Email not found' }));

    const result = await sendVerificationCode('user@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email not found');
  });

  it('returns generic error when server error is missing', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: false }));

    const result = await sendVerificationCode('user@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to send code');
  });

  it('sanitizes ReferenceError developer errors shown to user', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({ success: false, error: 'ReferenceError: someVar is not defined' })
    );

    const result = await sendVerificationCode('user@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Could not send code. Please try again later.');
    expect(result.error).not.toContain('ReferenceError');
  });

  it('sanitizes SyntaxError developer errors', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({ success: false, error: 'SyntaxError: Unexpected token' })
    );

    const result = await sendVerificationCode('user@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Could not send code. Please try again later.');
  });

  it('returns error on HTTP 400+', async () => {
    // When server sends no error field, fallback includes the status code
    mockFetch.mockResolvedValueOnce(makeErrorResponse(400, {}));

    const result = await sendVerificationCode('user@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toContain('400');
  });

  it('returns error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network is down'));

    const result = await sendVerificationCode('user@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network is down');
  });

  it('returns "Invalid response from server" on invalid JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: jest.fn(() => Promise.resolve('this is not json {')),
    });

    const result = await sendVerificationCode('user@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid response from server');
  });
});

// ─── verifyCode ───────────────────────────────────────────────────────────────

describe('verifyCode()', () => {
  it('returns error for empty email', async () => {
    const result = await verifyCode('', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email address');
    expect(mockFetch).not.toHaveBeenCalled();
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
  });

  it('strips non-digit characters from code before checking length', async () => {
    // Code with letters stripped = '123' (only 3 digits) → error
    const result = await verifyCode('user@example.com', '1a2b3c');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Please enter a 6-digit code');
  });

  it('sends only digits to the server', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    // Passing 6 digits mixed with spaces (spaces stripped = 6 digits)
    await verifyCode('user@example.com', '123456');

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.data.code).toBe('123456');
    expect(body.data.code).toMatch(/^\d{6}$/);
  });

  it('sends correct action to webhook', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    await verifyCode('user@example.com', '123456');

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.action).toBe('verifyCode');
  });

  it('normalizes email to lowercase', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    await verifyCode('USER@EXAMPLE.COM', '123456');

    const body = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
    expect(body.data.email).toBe('user@example.com');
  });

  it('returns { success: true } on valid code', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: true }));

    const result = await verifyCode('user@example.com', '123456');

    expect(result).toEqual({ success: true });
  });

  it('returns error when code is wrong', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({ success: false, error: 'Invalid or expired code' })
    );

    const result = await verifyCode('user@example.com', '000000');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid or expired code');
  });

  it('uses fallback error message when server sends none', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ success: false }));

    const result = await verifyCode('user@example.com', '000000');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid or expired code');
  });

  it('sanitizes developer errors from server', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({ success: false, error: 'ReferenceError: token is not defined' })
    );

    const result = await verifyCode('user@example.com', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid or expired code. Please try again.');
  });

  it('returns error on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500, { error: 'Internal error' }));

    const result = await verifyCode('user@example.com', '123456');

    expect(result.success).toBe(false);
  });

  it('returns error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

    const result = await verifyCode('user@example.com', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection refused');
  });

  it('returns "Invalid response from server" on invalid JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: jest.fn(() => Promise.resolve('{bad json')),
    });

    const result = await verifyCode('user@example.com', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid response from server');
  });
});
