import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
const { Client } = pg;

const dir = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(join(dir, '../.env'), 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i < 0) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const client = new Client({ connectionString: env.SUPABASE_DIRECT_CONNECTION_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

await client.query(`
  INSERT INTO saved_notes (user_id, category, title, content, is_quick_note)
  SELECT u.id, 'activity', 'Meditation', 'Did meditation today', true
  FROM app_users u WHERE u.username = 'yousafali'
  ON CONFLICT DO NOTHING;
`);

console.log('Added Meditation as activity note');
await client.end();
