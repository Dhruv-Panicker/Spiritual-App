/**
 * Environment Configuration
 * Reads from Expo extra (populated by app.config.js from .env or EAS secrets).
 *
 * Setup:
 * 1. Copy .env.example to .env and fill in values (local dev).
 * 2. EAS Build: use `eas secret:create` for production.
 * 3. See ENV_SETUP.md for full instructions.
 */

import Constants from 'expo-constants';

// Get environment variables from app.json extra or process.env
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Try app.json extra first (recommended for Expo)
  const extra = Constants.expoConfig?.extra || {};
  if (extra[key] && (extra[key] as string).trim() !== '') {
    return extra[key] as string;
  }
  
  // Fall back to process.env (for development if using dotenv)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!;
  }
  
  // Use default value if provided
  if (defaultValue) {
    if (__DEV__) {
      console.warn(`⚠️ Environment variable ${key} not set, using empty string. Please configure in app.json extra or .env`);
    }
    return defaultValue;
  }
  
  return '';
};

// Configuration object
export const env = {
  // Google Sheets Configuration
  googleSheetsApiKey: getEnvVar('GOOGLE_SHEETS_API_KEY'),
  googleSheetId: getEnvVar('GOOGLE_SHEET_ID'),
  googleAppsScriptWebhookUrl: getEnvVar('GOOGLE_APPS_SCRIPT_WEBHOOK_URL'),
  
  // Admin Configuration
  adminEmails: (() => {
    const emailsStr = getEnvVar('ADMIN_EMAILS');
    if (!emailsStr) return [];
    return emailsStr
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
  })(),

  // Prayer: email where all prayers are sent (must be set in .env or EAS secrets)
  prayerRecipientEmail: getEnvVar('PRAYER_RECIPIENT_EMAIL'),

  // Share / app links (optional; defaults used if not set)
  appName: getEnvVar('APP_NAME', 'Siddhguru'),
  appStoreLink: getEnvVar('APP_STORE_LINK', 'https://apps.apple.com/app/siddhguru/id6761345708'),
  playStoreLink: getEnvVar('PLAY_STORE_LINK', 'https://play.google.com/store/apps/details?id=com.spiritualapp.gurudarshan'),
  webAppLink: getEnvVar('WEB_APP_LINK', 'https://spiritualwisdom.app'),
} as const;

// Validate required environment variables (development only)
export const validateEnv = (): void => {
  if (!__DEV__) return;
  
  const required: Array<keyof typeof env> = [
    'googleSheetsApiKey',
    'googleSheetId',
    'googleAppsScriptWebhookUrl',
    'prayerRecipientEmail',
  ];
  
  const missing: string[] = [];
  
  required.forEach(key => {
    if (!env[key] || (typeof env[key] === 'string' && env[key].trim() === '')) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('💡 Set these in .env (copy from .env.example) or EAS secrets. See ENV_SETUP.md.');
  } else {
    console.log('✅ Environment variables loaded successfully');
  }
};

// Call validation on import (only in development)
if (__DEV__) {
  validateEnv();
}

