# Spiritual App

A React Native (Expo) app for spiritual content and community: quotes, videos, event calendar, prayers, and Siddhguru information. Data is backed by Google Sheets and a Google Apps Script web app for auth and write operations.

## Features

- **Auth:** Email sign-up with 2FA code, login, and session handling. Duplicate-email check on sign-up; logout returns to welcome.
- **Home:** Hero content and quick access to main sections.
- **Quotes:** Browse and (admin) manage quotes sourced from the sheet.
- **Videos:** Browse and (admin) manage video entries with links.
- **Calendar:** Events from the sheet: hero card, “All Upcoming Events” list, “Browse by Month” grid, month and event detail bottom sheets, and “See more” links for event URLs.
- **Siddhguru:** Information and media about the teacher.
- **Prayer:** Submit prayer requests; sent via the webhook to a configurable recipient.
- **Admin:** Content and event management (quotes, videos, events including event links). Gated by admin email list.
- **Push:** Expo Notifications; device tokens can be registered via the webhook for future use.

## Tech Stack

- **Frontend:** React Native 0.76, Expo SDK 52, Expo Router (file-based tabs).
- **State / storage:** In-memory session and AsyncStorage for persistence.
- **Backend:** Google Sheets API (read), Google Apps Script HTTP endpoint (auth, 2FA, prayers, tokens, admin CRUD).

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (or use `npx expo`)
- For builds: EAS CLI and an Expo account

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy env template and set values:

   ```bash
   cp .env.example .env
   ```

   Required for full functionality:

   - `GOOGLE_SHEETS_API_KEY` – API key for Sheets API (read).
   - `GOOGLE_SHEET_ID` – ID of the spreadsheet.
   - `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` – URL of the deployed Apps Script web app (doGet/doPost).
   - `ADMIN_EMAILS` – Comma-separated emails that can access the Admin tab.
   - `PRAYER_RECIPIENT_EMAIL` – Where to send prayer submissions.

   Optional: `APP_NAME`, `APP_STORE_LINK`, `PLAY_STORE_LINK`, `WEB_APP_LINK` for share and store links.

3. Run the app:

   ```bash
   npm start
   ```

   Then choose iOS simulator, Android emulator, or web. For device builds use EAS Build; set the same env vars as EAS secrets.

## Scripts

| Command           | Description                    |
|------------------|--------------------------------|
| `npm start`      | Start Expo dev server          |
| `npm run ios`    | Start with iOS simulator       |
| `npm run android`| Start with Android emulator    |
| `npm run web`    | Start for web                  |
| `npm run generate-icon` | Regenerate app icon from `assets/images/om_logo_transparent.png` |

## Project Structure

- `app/` – Expo Router routes: `(tabs)/` for main tabs (index, quotes, videos, calendar, gurudev, prayer, admin), plus auth and layout screens.
- `components/` – Shared UI (e.g. auth flows, calendar hero and pills, bottom sheets).
- `constants/` – Theme and app constants (e.g. `SpiritualColors.ts`).
- `services/` – Google Sheets client, Apps Script webhook client, share and notification helpers.
- `assets/` – Images and static assets; app icon path used by `scripts/generate-app-icon.js`.
- `scripts/` – App icon generation script.

## Configuration

- App identity and scheme: `app.json` (name, slug, bundle IDs, splash, notifications).
- Env injection: `app.config.js` loads `.env` and passes listed keys into `expo.extra` for runtime use. For EAS Build, configure secrets in the Expo dashboard or via `eas secret:create`.

## License

Proprietary. All rights reserved.
