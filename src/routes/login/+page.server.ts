import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { createSessionToken, SESSION_COOKIE, cookieOptions } from '$lib/server/session';
import { auditLog, getClientIP, isValidAccessCode, isValidUsername } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) throw redirect(303, '/dashboard');
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const username = String(form.get('username') ?? '').toLowerCase().trim();
    const access_code = String(form.get('access_code') ?? '').trim();
    const ip = getClientIP(request);

    // ── Basic validation ──────────────────────────────────────────────────
    if (!isValidUsername(username)) {
      return fail(400, { error: 'Invalid username format.' });
    }

    if (!isValidAccessCode(access_code)) {
      return fail(400, { error: 'Access code must be exactly 6 digits.' });
    }

    // ── Verify credentials via pgcrypto RPC ───────────────────────────────
    const { data, error } = await supabaseAdmin.rpc('verify_access_code', {
      p_username: username,
      p_code: access_code
    });

    if (error) {
      console.error('Login RPC error:', error);
      return fail(500, { error: 'Login service unavailable. Please try again.' });
    }

    if (!data || data.length === 0) {
      await auditLog({ actor_id: null, actor_username: username, action: 'login_failed', ip_address: ip });
      return fail(401, { error: 'Invalid username or access code.' });
    }

    const user = data[0] as {
      id: string;
      username: string;
      role: 'master_admin' | 'admin' | 'user';
      display_name: string | null;
      is_active: boolean;
    };

    if (!user.is_active) {
      return fail(403, { error: 'Your account has been disabled. Contact the administrator.' });
    }

    // ── Update last_login_at ───────────────────────────────────────────────
    await supabaseAdmin.from('app_users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);

    // ── Audit success ──────────────────────────────────────────────────────
    await auditLog({
      actor_id: user.id,
      actor_username: user.username,
      action: 'login_success',
      ip_address: ip
    });

    // ── Create session cookie ─────────────────────────────────────────────
    const token = await createSessionToken({
      id: user.id,
      username: user.username,
      role: user.role,
      display_name: user.display_name
    });

    const isSecure = request.url.startsWith('https://');
    cookies.set(SESSION_COOKIE, token, cookieOptions(isSecure));

    throw redirect(303, '/dashboard');
  }
};
