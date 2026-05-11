// ── Server-only: Supabase Admin client (service role) ─────────────────────
// IMPORTANT: This file must ONLY be imported in +server.ts / +page.server.ts
// The service role key bypasses all RLS — never expose it to the browser.

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
