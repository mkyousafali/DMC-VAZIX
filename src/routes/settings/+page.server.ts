import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
  requireAuth(locals.user);
  const user = locals.user;

  const { data: settings } = await supabaseAdmin
    .from('app_settings')
    .select('key, value')
    .eq('user_id', user.id);

  const settingsMap: Record<string, unknown> = {};
  for (const s of settings ?? []) settingsMap[s.key] = s.value;

  return { user, settings: settingsMap };
};

export const actions: Actions = {
  updateDisplayName: async ({ request, locals }) => {
    requireAuth(locals.user);
    const form = await request.formData();
    const display_name = String(form.get('display_name') ?? '').trim() || null;

    const { error } = await supabaseAdmin
      .from('app_users')
      .update({ display_name })
      .eq('id', locals.user!.id);

    if (error) return fail(500, { error: 'Failed to update display name.' });
    return { success: true };
  }
};
