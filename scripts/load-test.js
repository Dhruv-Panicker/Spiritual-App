/**
 * k6 load test — simulates launch-day traffic against the app's real backend
 * (Google Sheets API reads + Apps Script webhook read-only actions).
 *
 * Each iteration = one user cold-opening the app:
 *   - reads quotes, videos, events sheets (Sheets API)
 *   - checks live status (webhook)
 *   - checks a (nonexistent) email in userbase (webhook) — read-only
 *
 * NO write actions are exercised (no logUserLogin, savePushToken, append,
 * submitPrayer, addToUserbase) so the test leaves the sheet untouched.
 *
 * Usage (from project root):
 *   smoke test:   set -a; source .env; set +a; k6 run -e SMOKE=1 scripts/load-test.js
 *   scaled ramp:  set -a; source .env; set +a; k6 run scripts/load-test.js
 *   full ramp:    set -a; source .env; set +a; k6 run -e FULL=1 scripts/load-test.js
 *   cached sim:   add -e CACHED=1 — simulates the client-side AsyncStorage cache:
 *                 each VU reads the sheets only on its first iteration (cold
 *                 install), later iterations skip them like a cache hit would.
 *
 * The default (scaled) ramp is quota-conscious: Apps Script consumer accounts
 * get ~90 min total runtime/day, so keep big runs away from launch windows.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const SHEET_ID = __ENV.GOOGLE_SHEET_ID;
const API_KEY = __ENV.GOOGLE_SHEETS_API_KEY;
const WEBHOOK_URL = __ENV.GOOGLE_APPS_SCRIPT_WEBHOOK_URL;

if (!SHEET_ID || !API_KEY || !WEBHOOK_URL) {
  throw new Error(
    'Missing env vars. Run with: set -a; source .env; set +a; k6 run scripts/load-test.js'
  );
}

const SHEETS_BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;

const smoke = !!__ENV.SMOKE;
const launch1000 = !!__ENV.LAUNCH1000;

export const options = launch1000
  ? {
      // ~1000 distinct users arriving over ~3.5 min, webhook-only (see default fn).
      // Sheets API is excluded: from one test machine all VUs share an IP, so
      // Google's per-IP limit fires in a way real users never see.
      scenarios: {
        launch_wave: {
          executor: 'ramping-arrival-rate',
          startRate: 1,
          timeUnit: '1s',
          preAllocatedVUs: 100,
          maxVUs: 300,
          stages: [
            { duration: '30s', target: 4 },
            { duration: '2m', target: 6 },
            { duration: '1m', target: 4 },
          ],
        },
      },
      thresholds: {
        http_req_failed: ['rate<0.05'],
        http_req_duration: ['p(95)<8000'],
      },
    }
  : smoke
  ? {
      vus: 1,
      iterations: 2,
      thresholds: {
        http_req_failed: ['rate<0.01'],
      },
    }
  : {
      scenarios: {
        launch_spike: {
          executor: 'ramping-vus',
          startVUs: 0,
          stages: __ENV.FULL
            ? [
                { duration: '1m', target: 25 },
                { duration: '2m', target: 50 },
                { duration: '2m', target: 100 },
                { duration: '30s', target: 0 },
              ]
            : [
                { duration: '45s', target: 15 },
                { duration: '1m', target: 40 },
                { duration: '45s', target: 40 },
                { duration: '15s', target: 0 },
              ],
          gracefulRampDown: '10s',
        },
      },
      thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<5000'],
      },
    };

function readSheet(sheetName) {
  const res = http.get(`${SHEETS_BASE}/${sheetName}?key=${API_KEY}`, {
    tags: { endpoint: `sheets:${sheetName}` },
  });
  check(res, {
    [`${sheetName}: status 200`]: (r) => r.status === 200,
    [`${sheetName}: has values`]: (r) => {
      try {
        return Array.isArray(r.json('values'));
      } catch {
        return false;
      }
    },
  });
  if (res.status === 429) {
    console.warn(`RATE LIMITED on sheets:${sheetName}`);
  }
  return res;
}

function webhookPost(action, data, tag) {
  const body = data ? { action, data } : { action };
  const res = http.post(WEBHOOK_URL, JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: `webhook:${tag || action}` },
    redirects: 5, // Apps Script responds via a 302 to script.googleusercontent.com
  });
  check(res, {
    [`${action}: status 200`]: (r) => r.status === 200,
  });
  return res;
}

// Per-VU state: with CACHED=1, only the first iteration is a cold install
let hasCache = false;

export default function () {
  if (launch1000) {
    // One brand-new user's webhook traffic: login check + live status
    webhookPost(
      'checkUserInUserbase',
      { email: `k6-loadtest-${__VU}-${__ITER}@example.invalid` },
      'checkUser'
    );
    sleep(0.5);
    webhookPost('getLiveStatus');
    return;
  }

  const coldOpen = !__ENV.CACHED || !hasCache;

  if (coldOpen) {
    // Cold open: the three content sheets the app loads (cache miss)
    readSheet('quotes');
    sleep(0.3);
    readSheet('videos');
    sleep(0.3);
    readSheet('events');
    sleep(0.5);

    // Login lookup with an address that will never exist — pure read, no side effects
    webhookPost(
      'checkUserInUserbase',
      { email: `k6-loadtest-${__VU}@example.invalid` },
      'checkUser'
    );
    sleep(0.5);
    hasCache = true;
  }

  // getLiveStatus is NOT cached client-side — every app open still calls it
  webhookPost('getLiveStatus');

  // Think time before this "user" would open the app again
  sleep(2);
}

export function handleSummary(data) {
  const failRate = data.metrics.http_req_failed
    ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2)
    : 'n/a';
  const p95 = data.metrics.http_req_duration
    ? Math.round(data.metrics.http_req_duration.values['p(95)'])
    : 'n/a';
  console.log(`\n=== SUMMARY: fail rate ${failRate}% | p95 latency ${p95}ms ===\n`);
  return {
    stdout: JSON.stringify(
      {
        requests: data.metrics.http_reqs?.values.count,
        fail_rate_pct: failRate,
        p95_ms: p95,
        max_vus: data.metrics.vus_max?.values.max,
      },
      null,
      2
    ),
  };
}
