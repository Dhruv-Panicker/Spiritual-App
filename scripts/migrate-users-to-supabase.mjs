/**
 * One-time user migration: Google Sheets → Supabase.
 * - userbase tab  → Supabase auth accounts (pre-verified) + public.users rows
 * - pushTokens tab → public.push_tokens
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<secret key> node scripts/migrate-users-to-supabase.mjs
 *
 * Reads SUPABASE_URL, GOOGLE_SHEETS_API_KEY, GOOGLE_SHEET_ID, ADMIN_EMAILS
 * from .env. The service-role key is passed on the command line only.
 *
 * Idempotent and non-destructive: existing auth accounts and profile rows
 * (e.g. people who already signed up through the app) are left untouched;
 * only missing ones are created. Safe to re-run.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHEETS_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

for (const [name, value] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY, GOOGLE_SHEETS_API_KEY: SHEETS_KEY, GOOGLE_SHEET_ID: SHEET_ID })) {
  if (!value) {
    console.error(`Missing ${name} (check .env, pass SUPABASE_SERVICE_ROLE_KEY on the command line)`);
    process.exit(1);
  }
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function readTab(tab) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tab)}?key=${SHEETS_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API ${res.status} for tab "${tab}": ${await res.text()}`);
  return (await res.json()).values || [];
}

/** All existing Supabase auth users as an email → id map. */
async function loadAuthUsers() {
  const map = new Map();
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) {
      if (u.email) map.set(u.email.toLowerCase(), u.id);
    }
    if (data.users.length < 1000) break;
    page++;
  }
  return map;
}

// ─── Users ────────────────────────────────────────────────────────────────────

async function migrateUsers() {
  console.log('\nUsers:');
  const [, ...rows] = await readTab('userbase'); // header: [User Email, User Name, Verified]

  // Dedupe sheet rows by email, keep the first occurrence
  const sheetUsers = new Map();
  for (const row of rows) {
    const email = (row[0] || '').trim().toLowerCase();
    if (!email || !email.includes('@') || sheetUsers.has(email)) continue;
    sheetUsers.set(email, { name: (row[1] || '').trim() || email.split('@')[0] });
  }

  const authUsers = await loadAuthUsers();
  const { data: profileRows, error: profileError } = await supabase.from('users').select('email');
  if (profileError) throw new Error(`read users table: ${profileError.message}`);
  const existingProfiles = new Set((profileRows || []).map((r) => r.email.toLowerCase()));

  let createdAuth = 0, createdProfiles = 0, skipped = 0;
  for (const [email, { name }] of sheetUsers) {
    // 1. Auth account (email pre-confirmed so login OTP works immediately)
    let id = authUsers.get(email);
    if (!id) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (error) {
        console.warn(`  ! could not create auth account for ${email}: ${error.message}`);
        continue;
      }
      id = data.user.id;
      createdAuth++;
    }

    // 2. Profile row
    if (existingProfiles.has(email)) {
      skipped++;
      continue;
    }
    const { error: insertError } = await supabase.from('users').insert({
      id,
      email,
      name,
      is_admin: ADMIN_EMAILS.includes(email),
    });
    if (insertError) {
      console.warn(`  ! could not create profile for ${email}: ${insertError.message}`);
      continue;
    }
    createdProfiles++;
  }

  // Ensure ADMIN_EMAILS are flagged even if their profile predates this run
  if (ADMIN_EMAILS.length) {
    const { error } = await supabase.from('users').update({ is_admin: true }).in('email', ADMIN_EMAILS);
    if (error) console.warn(`  ! could not update admin flags: ${error.message}`);
  }

  console.log(`  ${sheetUsers.size} users in sheet → ${createdAuth} auth accounts created, ${createdProfiles} profiles created, ${skipped} already existed`);
  console.log(`  admins flagged: ${ADMIN_EMAILS.join(', ') || '(none in ADMIN_EMAILS)'}`);
}

// ─── Push tokens ──────────────────────────────────────────────────────────────

async function migratePushTokens() {
  console.log('\nPush tokens:');
  const [, ...rows] = await readTab('pushTokens'); // header: [email, pushToken, platform, lastUpdated]

  // Dedupe by token, keeping the most recent row for each
  const byToken = new Map();
  for (const row of rows) {
    const email = (row[0] || '').trim().toLowerCase();
    const token = (row[1] || '').trim();
    if (!email || !token) continue;
    const updated = new Date(row[3] || 0);
    const prev = byToken.get(token);
    if (!prev || updated > prev.updated) {
      byToken.set(token, {
        email,
        platform: (row[2] || '').trim(),
        updated: isNaN(updated.getTime()) ? new Date() : updated,
      });
    }
  }

  const out = [...byToken.entries()].map(([token, t]) => ({
    token,
    email: t.email,
    platform: t.platform,
    updated_at: t.updated.toISOString(),
  }));
  if (out.length) {
    const { error } = await supabase.from('push_tokens').upsert(out, { onConflict: 'token' });
    if (error) throw new Error(`upsert push_tokens: ${error.message}`);
  }
  console.log(`  migrated ${out.length} push tokens (${rows.length - out.length} duplicate/empty rows collapsed)`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log(`Migrating users from Sheet ${SHEET_ID} → ${SUPABASE_URL}`);
try {
  await migrateUsers();
  await migratePushTokens();
  const counts = {};
  for (const table of ['users', 'push_tokens']) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    counts[table] = count;
  }
  console.log('\nDone. Row counts in Supabase:', counts);
} catch (err) {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
}
