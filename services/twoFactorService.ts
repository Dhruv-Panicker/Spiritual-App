/**
 * Two-factor authentication service for sign-up.
 * Sends a 6-digit code to the user's email via the existing Apps Script webhook
 * and verifies the code. Requires the webhook to handle actions:
 * - sendVerificationCode
 * - verifyCode
 * See docs/APPS_SCRIPT_2FA.md for backend implementation.
 */

import { env } from '@/config/env';

/** Detect server-side JS errors we should not show to end users */
function isDeveloperError(message: string): boolean {
  const s = message.toLowerCase();
  return s.includes('referenceerror') || s.includes('syntaxerror') || s.includes('before initialization') || s.includes('is not defined');
}

const CODE_LENGTH = 6;
const RETRY_COOLDOWN_SECONDS = 30;

export interface SendCodeResult {
  success: boolean;
  error?: string;
}

export interface VerifyCodeResult {
  success: boolean;
  error?: string;
}

function getWebhookUrl(): string {
  const url = env.googleAppsScriptWebhookUrl;
  if (!url || !url.trim()) {
    throw new Error('Webhook URL is not configured. Set GOOGLE_APPS_SCRIPT_WEBHOOK_URL.');
  }
  return url;
}

/**
 * Request that a 6-digit verification code be sent to the given email.
 * The webhook must generate the code, store it with expiry, and email it.
 */
export async function sendVerificationCode(email: string): Promise<SendCodeResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }

  try {
    const response = await fetch(getWebhookUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendVerificationCode',
        data: { email: normalizedEmail },
      }),
    });

    const text = await response.text();
    let json: { success?: boolean; error?: string };
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      return { success: false, error: 'Invalid response from server' };
    }

    if (!response.ok) {
      return { success: false, error: json.error || `Request failed (${response.status})` };
    }
    if (json.success !== true) {
      const serverError = json.error || 'Failed to send code';
      // Don't show raw JS errors (e.g. ReferenceError) to the user
      const friendlyError = isDeveloperError(serverError) ? 'Could not send code. Please try again later.' : serverError;
      return { success: false, error: friendlyError };
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
 * The webhook must check the stored code for this email and return success/failure.
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

  try {
    const response = await fetch(getWebhookUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verifyCode',
        data: { email: normalizedEmail, code: digits },
      }),
    });

    const text = await response.text();
    let json: { success?: boolean; error?: string };
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      return { success: false, error: 'Invalid response from server' };
    }

    if (!response.ok) {
      return { success: false, error: json.error || `Request failed (${response.status})` };
    }
    if (json.success !== true) {
      const serverError = json.error || 'Invalid or expired code';
      const friendlyError = isDeveloperError(serverError) ? 'Invalid or expired code. Please try again.' : serverError;
      return { success: false, error: friendlyError };
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
