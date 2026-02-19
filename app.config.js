/**
 * Expo app config: loads .env and injects environment variables into extra.
 * - Local: create .env from .env.example and fill in values.
 * - EAS Build: set secrets with `eas secret:create`; they are available as process.env.
 * See ENV_SETUP.md for details.
 */
const path = require('path');

// Load .env from project root (for local dev and any env file)
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const appJson = require('./app.json');
const expoConfig = appJson.expo || {};

// Env keys we inject into extra (from .env or EAS secrets)
const ENV_KEYS = [
  'GOOGLE_SHEETS_API_KEY',
  'GOOGLE_SHEET_ID',
  'GOOGLE_APPS_SCRIPT_WEBHOOK_URL',
  'GOOGLE_OAUTH_CLIENT_ID',
  'ADMIN_EMAILS',
  'APP_NAME',
  'APP_STORE_LINK',
  'PLAY_STORE_LINK',
  'WEB_APP_LINK',
];

const extraFromEnv = {};
ENV_KEYS.forEach((key) => {
  const value = process.env[key];
  if (value !== undefined && value !== '') {
    extraFromEnv[key] = value;
  }
});

// Merge: base extra (e.g. eas.projectId) + env-loaded values (override)
const extra = {
  ...(expoConfig.extra || {}),
  ...extraFromEnv,
};

module.exports = {
  expo: {
    ...expoConfig,
    extra,
  },
};
