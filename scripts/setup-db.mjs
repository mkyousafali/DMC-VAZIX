/**
 * DMC-VAZIX Database Setup Script
 * Run: node scripts/setup-db.mjs
 * Requires: SUPABASE_SERVICE_ROLE_KEY and PUBLIC_SUPABASE_URL in .env
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read env file manually (no dotenv dep needed with Node 20+)
const envText = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const env = Object.fromEntries(
  envText.split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(p => p.trim()))
    .filter(([k]) => k)
    .map(([k, ...v]) => [k, v.join('=')])
);

const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const serviceKey  = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Execute SQL in chunks split by double-newline ";\n\n" to avoid timeouts
const sql = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');

// Split into individual statements
const statements = sql
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

let ok = 0, fail = 0;

for (const stmt of statements) {
  if (!stmt) continue;
  const full = stmt + ';';
  const { error } = await supabase.rpc('exec_sql', { query: full }).catch(() => ({ error: 'rpc_unavailable' }));

  if (error === 'rpc_unavailable') {
    // Fall back to direct query via Supabase REST if exec_sql not available
    break;
  }
  if (error) {
    console.warn('⚠ ', error.message ?? error, '\n  stmt:', full.slice(0, 80));
    fail++;
  } else {
    ok++;
  }
}

// --- Alternative: Use Postgres URL directly via fetch to Supabase SQL API ---
// Supabase SQL API (pg-meta) at /rest/v1/sql is not available in all plans
// So let's use the Supabase Management API (requires SUPABASE_ACCESS_TOKEN from dashboard)

console.log('\n✅ Setup script complete.');
console.log(`   Ran ${ok} statements OK, ${fail} failed/skipped.`);
if (fail > 0 || ok === 0) {
  console.log('\n📋 If automated setup failed, paste supabase/schema.sql in the Supabase SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/bvsynxmxoucjlqaurytz/sql/new`);
}
