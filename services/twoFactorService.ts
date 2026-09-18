/**
 * Two-factor authentication service.
 * Sends a 6-digit code to the user's email via Supabase Auth (email OTP)
 * and verifies it. Verifying creates the Supabase session.
 */

import { supabase } from '@/services/supabaseClient';

const CODE_LENGTH = 6;

/**
 * Google Play's review team cannot receive our emailed login code, so this one
 * address signs in with a password instead of an OTP. The reviewer types the
 * password into the same 6-digit code field.
 *
 * Only the address lives in the app bundle — the password is stored in Supabase
 * and in Play Console's "Sign in details", never here. The account is an
 * ordinary user with no admin rights.
 */
const REVIEW_EMAIL = 'playstore.review@omsiddheshwar.app';

function isReviewAccount(email: string): boolean {
  return email === REVIEW_EMAIL;
}
// Supabase enforces a 60s minimum between OTP emails to the same address.
const RETRY_COOLDOWN_SECONDS = 60;

export interface SendCodeResult {
  success: boolean;
  error?: string;
  /** True when the email has no account (login with shouldCreateUser: false). */
  userNotFound?: boolean;
}

export interface VerifyCodeResult {
  success: boolean;
  error?: string;
}

function friendlySendError(message: string): string {
  const s = message.toLowerCase();
  if (s.includes('signups not allowed')) {
    return 'No account found for this email.';
  }
  // e.g. "email rate limit exceeded", "For security purposes, you can only
  // request this after 54 seconds"
  if (s.includes('rate limit') || s.includes('security purposes') || s.includes('only request this')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  return message || 'Could not send code. Please try again later.';
}

export interface SendCodeOptions {
  /** Set false for login: fails with userNotFound instead of creating an account. */
  shouldCreateUser?: boolean;
}

/**
 * Request that a 6-digit verification code be sent to the given email.
 */
export async function sendVerificationCode(
  email: string,
  options: SendCodeOptions = {}
): Promise<SendCodeResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }

  // No code to send for the review account — it authenticates by password.
  if (isReviewAccount(normalizedEmail)) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: options.shouldCreateUser !== false },
    });
    if (error) {
      const userNotFound = error.message.toLowerCase().includes('signups not allowed');
      return { success: false, error: friendlySendError(error.message), userNotFound };
    }
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    console.error('sendVerificationCode error:', err);
    return { success: false, error: message };
  }
}

/**
 * Verify the 6-digit code entered by the user.
 * On success the Supabase session is established and persisted.
 */
export async function verifyCode(email: string, code: string): Promise<VerifyCodeResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const digits = code.replace(/\D/g, '');
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }
  if (digits.length !== CODE_LENGTH) {
    return { success: false, error: `Please enter a ${CODE_LENGTH}-digit code` };
  }

  if (isReviewAccount(normalizedEmail)) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: digits,
    });
    if (error || !data.session) {
      return { success: false, error: 'Invalid or expired code. Please try again.' };
    }
    return { success: true };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: digits,
      type: 'email',
    });
    if (error || !data.session) {
      const raw = error?.message || 'Invalid or expired code';
      const friendly = raw.toLowerCase().includes('expired') || raw.toLowerCase().includes('invalid')
        ? 'Invalid or expired code. Please try again.'
        : raw;
      return { success: false, error: friendly };
    }
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    console.error('verifyCode error:', err);
    return { success: false, error: message };
  }
}

export const twoFactorService = {
  sendVerificationCode,
  verifyCode,
  CODE_LENGTH,
  RETRY_COOLDOWN_SECONDS,
};
