import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireMasterAdmin, auditLog, getClientIP, isValidAccessCode, isValidUsername } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import type { AppUser } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
  requireMasterAdmin(locals.user);

  const { data } = await supabaseAdmin
    .from('app_users')
    .select('id, username, display_name, role, is_active, created_at, last_login_at')
    .order('created_at', { ascending: true });

  return { users: (data ?? []) as AppUser[], user: locals.user };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    requireMasterAdmin(locals.user);
    const admin = locals.user!;
    const form = await request.formData();

    const username     = String(form.get('username') ?? '').toLowerCase().trim();
    const access_code  = String(form.get('access_code') ?? '').trim();
    const role         = String(form.get('role') ?? 'user');
    const display_name = String(form.get('display_name') ?? '').trim() || null;

    if (!isValidUsername(username)) return fail(400, { error: 'Invalid username (3-30 chars, alphanumeric + underscore).' });
    if (!isValidAccessCode(access_code)) return fail(400, { error: 'Access code must be exactly 6 digits.' });
    if (!['user', 'admin'].includes(role)) return fail(400, { error: 'Invalid role.' });

    const { data: newId, error: err } = await supabaseAdmin.rpc('create_app_user', {
      p_username: username,
      p_code: access_code,
      p_role: role,
      p_display_name: display_name,
      p_created_by: admin.id
    });

    if (err) {
      if (err.message.includes('unique')) return fail(400, { error: 'Username already exists.' });
      return fail(500, { error: 'Failed to create user.' });
    }

    await auditLog({
      actor_id: admin.id,
      actor_username: admin.username,
      action: 'user_created',
      target_type: 'app_users',
      target_id: newId as string,
      details: { username, role },
      ip_address: getClientIP(request)
    });

    return { success: true };
  },

  toggleActive: async ({ request, locals }) => {
    requireMasterAdmin(locals.user);
    const admin = locals.user!;
    const form = await request.formData();

    const id        = String(form.get('id') ?? '');
    const is_active = form.get('is_active') === 'true';

    if (!id) return fail(400, { error: 'User ID required.' });

    await supabaseAdmin.from('app_users').update({ is_active }).eq('id', id);

    await auditLog({
      actor_id: admin.id,
      actor_username: admin.username,
      action: is_active ? 'user_enabled' : 'user_disabled',
      target_type: 'app_users',
      target_id: id,
      ip_address: getClientIP(request)
    });

    return { success: true };
  },

  resetCode: async ({ request, locals }) => {
    requireMasterAdmin(locals.user);
    const admin = locals.user!;
    const form = await request.formData();

    const id       = String(form.get('id') ?? '');
    const new_code = String(form.get('new_code') ?? '').trim();

    if (!id) return fail(400, { error: 'User ID required.' });
    if (!isValidAccessCode(new_code)) return fail(400, { error: 'New code must be exactly 6 digits.' });

    const { error: err } = await supabaseAdmin.rpc('reset_access_code', {
      p_user_id: id,
      p_new_code: new_code
    });

    if (err) return fail(500, { error: 'Failed to reset access code.' });

    await auditLog({
      actor_id: admin.id,
      actor_username: admin.username,
      action: 'access_code_reset',
      target_type: 'app_users',
      target_id: id,
      ip_address: getClientIP(request)
    });

    return { success: true };
  }
};
