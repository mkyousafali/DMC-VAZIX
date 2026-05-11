import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import type { SavedNote } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
  requireAuth(locals.user);
  const user = locals.user;

  const { data } = await supabaseAdmin
    .from('saved_notes')
    .select('*')
    .eq('user_id', user.id)
    .order('is_quick_note', { ascending: false })
    .order('use_count', { ascending: false });

  return { notes: (data ?? []) as SavedNote[], user };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    requireAuth(locals.user);
    const form = await request.formData();
    const title    = String(form.get('title') ?? '').trim();
    const content  = String(form.get('content') ?? '').trim();
    const category = String(form.get('category') ?? 'general').trim();
    const is_quick = form.get('is_quick_note') === 'on';

    if (!title || !content) return fail(400, { error: 'Title and content are required.' });

    const { error } = await supabaseAdmin.from('saved_notes').insert({
      user_id: locals.user!.id,
      title, content, category, is_quick_note: is_quick
    });

    if (error) return fail(500, { error: 'Failed to save note.' });
    return { success: true };
  },

  delete: async ({ request, locals }) => {
    requireAuth(locals.user);
    const form = await request.formData();
    const id = String(form.get('id') ?? '');
    if (!id) return fail(400, { error: 'Note ID required.' });

    // Ensure ownership
    const { data: note } = await supabaseAdmin.from('saved_notes').select('user_id').eq('id', id).single();
    if (!note || note.user_id !== locals.user!.id) return fail(403, { error: 'Access denied.' });

    await supabaseAdmin.from('saved_notes').delete().eq('id', id);
    return { success: true };
  }
};
