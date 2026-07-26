/**
 * One-time content migration: Google Sheets → Supabase.
 * Migrates quotes (with images → Supabase Storage), videos, and events.
 * Users/push tokens are migrated separately at cutover.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<secret key> node scripts/migrate-sheets-to-supabase.mjs
 *
 * Reads SUPABASE_URL, GOOGLE_SHEETS_API_KEY, GOOGLE_SHEET_ID from .env.
 * The service-role key is passed on the command line only — NEVER commit it.
 *
 * Idempotent by wipe-and-reload: clears the quotes/videos/events tables
 * before inserting, so re-running never duplicates rows. Any rows added
 * directly in Supabase before running this (e.g. test quotes) are removed.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SHEETS_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

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
  const json = await res.json();
  return json.values || [];
}

function driveFileId(url) {
  if (!url || !url.startsWith('http')) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function parseDateOrNull(s) {
  if (!s) return null;
  // Date-only strings like 2026-07-19 must be treated as plain calendar
  // dates: new Date() would parse them as UTC midnight, which lands on the
  // previous day when converted to a local date in UTC-negative timezones.
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s.trim());
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function toDateOnly(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Download a Drive image and upload it to the quote-images bucket. Returns public URL or null. */
async function migrateImage(imageUrl) {
  const fileId = driveFileId(imageUrl);
  if (!fileId) return imageUrl && imageUrl.startsWith('http') ? imageUrl : null;

  const res = await fetch(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`, { redirect: 'follow' });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.startsWith('image/')) {
    console.warn(`  ! could not download image ${fileId} (${res.status} ${contentType}) — keeping Drive URL`);
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  }
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const path = `${fileId}.${ext}`;
  const buffer = Buffer.from(await res.arrayBuffer());
  const { error } = await supabase.storage.from('quote-images').upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.warn(`  ! storage upload failed for ${fileId}: ${error.message} — keeping Drive URL`);
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/quote-images/${path}`;
}

async function wipe(table) {
  const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw new Error(`wipe ${table}: ${error.message}`);
}

async function insertAll(table, rows) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(`insert ${table}: ${error.message}`);
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

async function migrateQuotes() {
  console.log('\nQuotes:');
  const [, ...rows] = await readTab('quotes'); // first row is headers
  const out = [];
  const base = Date.now() - rows.length * 1000;
  for (const [index, row] of rows.entries()) {
    // Sheet columns: [id, text, author, category, imageUrl, dateAdded]
    const text = (row[1] || '').trim();
    const rawImage = (row[4] || '').trim();
    if (!text && !rawImage) continue;
    let imageUrl = null;
    if (rawImage) {
      imageUrl = await migrateImage(rawImage);
      console.log(`  image: ${rawImage.slice(0, 60)}… → ${imageUrl ? imageUrl.slice(0, 80) : 'none'}`);
    }
    // Always set created_at: batch inserts turn missing keys into NULLs
    // instead of column defaults. Fallback preserves sheet order.
    const created = parseDateOrNull(row[5]) || new Date(base + index * 1000);
    out.push({
      text,
      author: (row[2] || '').trim(),
      category: (row[3] || '').trim(),
      image_url: imageUrl,
      created_at: created.toISOString(),
    });
  }
  await wipe('quotes');
  await insertAll('quotes', out);
  console.log(`  migrated ${out.length} quotes (${rows.length - out.length} empty rows skipped)`);
}

// ─── Videos ───────────────────────────────────────────────────────────────────

async function migrateVideos() {
  console.log('\nVideos:');
  const [, ...rows] = await readTab('videos');
  const out = [];
  const base = Date.now() - rows.length * 1000;
  for (const [index, row] of rows.entries()) {
    // Sheet columns: [id, title, description, youtubeId, dateAdded]
    const title = (row[1] || '').trim();
    const youtubeId = (row[3] || '').trim();
    if (!title || !youtubeId) continue;
    const created = parseDateOrNull(row[4]) || new Date(base + index * 1000);
    out.push({
      title,
      description: (row[2] || '').trim(),
      youtube_id: youtubeId,
      created_at: created.toISOString(),
    });
  }
  await wipe('videos');
  await insertAll('videos', out);
  console.log(`  migrated ${out.length} videos (${rows.length - out.length} invalid rows skipped)`);
}

// ─── Events ───────────────────────────────────────────────────────────────────

async function migrateEvents() {
  console.log('\nEvents:');
  const rows = await readTab('events');
  // Same header heuristic as the app: skip the first row if it looks like labels
  const firstCell = rows[0]?.[0] ? String(rows[0][0]).trim().toLowerCase() : '';
  const isHeader = firstCell === 'id' || firstCell === 'title' || firstCell === 'event id' || firstCell === '' ||
    (/^[a-z\s]+$/.test(firstCell) && !firstCell.startsWith('event_'));
  const dataRows = isHeader ? rows.slice(1) : rows;

  const validTypes = ['meditation', 'teaching', 'celebration', 'retreat'];
  const out = [];
  let skipped = 0;
  for (const row of dataRows) {
    // Sheet columns: [id, title, date, time, description, location, type, link]
    const title = (row[1] || '').trim();
    const date = parseDateOrNull((row[2] || '').trim());
    if (!title || !date) {
      if (title || (row[2] || '').trim()) {
        console.warn(`  ! skipping "${title || row[2]}" — missing/unparseable ${!title ? 'title' : 'date'}`);
      }
      skipped++;
      continue;
    }
    const rawType = (row[6] || '').trim().toLowerCase();
    out.push({
      title,
      event_date: toDateOnly(date),
      event_time: (row[3] || '').trim(),
      description: (row[4] || '').trim(),
      location: (row[5] || '').trim() || null,
      event_type: validTypes.includes(rawType) ? rawType : 'meditation',
      link: (row[7] || '').trim() || null,
    });
  }
  await wipe('events');
  await insertAll('events', out);
  console.log(`  migrated ${out.length} events (${skipped} rows skipped)`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log(`Migrating content from Sheet ${SHEET_ID} → ${SUPABASE_URL}`);
try {
  await migrateQuotes();
  await migrateVideos();
  await migrateEvents();
  const counts = {};
  for (const table of ['quotes', 'videos', 'events']) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    counts[table] = count;
  }
  console.log('\nDone. Row counts in Supabase:', counts);
} catch (err) {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
}
