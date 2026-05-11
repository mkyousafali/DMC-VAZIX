/**
 * DMC-VAZIX Database Setup — Direct PostgreSQL connection
 * Run: node scripts/run-schema.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
const { Client } = pg;

const dir = dirname(fileURLToPath(import.meta.url));

// Parse .env manually
const envText = readFileSync(join(dir, '../.env'), 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx < 0) continue;
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
}

const connectionString = env.SUPABASE_DIRECT_CONNECTION_URL;
if (!connectionString) {
  console.error('Missing SUPABASE_DIRECT_CONNECTION_URL in .env');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

console.log('Connecting to Supabase PostgreSQL…');
await client.connect();
console.log('Connected.\n');

const sql = readFileSync(join(dir, '../supabase/schema.sql'), 'utf8');

// Execute the whole script at once
try {
  await client.query(sql);
  console.log('✅ Schema applied successfully!');
  console.log('\nTables created: app_users, mood_entries, saved_notes, app_settings, audit_log');
  console.log('Functions:      verify_access_code, create_app_user, reset_access_code');
  console.log('Master admin:   yousafali / 491709');
} catch (err) {
  console.error('❌ Schema error:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
