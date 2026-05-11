import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import { parseTags } from '$lib/utils';
import type { MoodEntry, SavedNote } from '$lib/types';

export const load: PageServerLoad = async ({ locals, params }) => {
  requireAuth(locals.user);
  const user = locals.user;

  const { data: entry } = await supabaseAdmin
    .from('mood_entries')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!entry) throw error(404, 'Entry not found');

  // Users can only edit their own entries; master_admin can edit any
  if (entry.user_id !== user.id && user.role !== 'master_admin') {
    throw error(403, 'Access denied');
  }

  const { data: notes } = await supabaseAdmin
    .from('saved_notes')
    .select('*')
    .eq('user_id', user.id)
    .order('use_count', { ascending: false });

  return {
    entry: entry as MoodEntry,
    notes: (notes ?? []) as SavedNote[],
    user
  };
};

export const actions: Actions = {
  update: async ({ request, locals, params }) => {
    requireAuth(locals.user);
    const user = locals.user;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('mood_entries').select('user_id').eq('id', params.id).single();
    if (!existing || (existing.user_id !== user.id && user.role !== 'master_admin')) {
      return fail(403, { error: 'Access denied' });
    }

    const form = await request.formData();

    const update = {
      entry_date:      String(form.get('entry_date') ?? ''),
      entry_time:      String(form.get('entry_time') ?? ''),
      mood_rating:     form.get('mood_rating')    ? Number(form.get('mood_rating'))    : null,
      sleep_hours:     form.get('sleep_hours')    ? Number(form.get('sleep_hours'))    : null,
      anxiety_rating:  form.get('anxiety_rating') ? Number(form.get('anxiety_rating')) : null,
      energy_rating:   form.get('energy_rating')  ? Number(form.get('energy_rating'))  : null,
      stress_rating:   form.get('stress_rating')  ? Number(form.get('stress_rating'))  : null,
      pain_rating:     form.get('pain_rating')    ? Number(form.get('pain_rating'))    : null,
      activity:        String(form.get('activity') ?? '').trim() || null,
      medication_note: String(form.get('medication_note') ?? '').trim() || null,
      trigger_event:   String(form.get('trigger_event') ?? '').trim() || null,
      general_note:    String(form.get('general_note') ?? '').trim() || null,
      tags:            parseTags(String(form.get('tags') ?? ''))
    };

    const { error: err } = await supabaseAdmin.from('mood_entries').update(update).eq('id', params.id);
    if (err) return fail(500, { error: 'Failed to update entry.' });

    throw redirect(303, '/today');
  },

  delete: async ({ locals, params }) => {
    requireAuth(locals.user);
    const user = locals.user;

    const { data: existing } = await supabaseAdmin
      .from('mood_entries').select('user_id').eq('id', params.id).single();
    if (!existing || (existing.user_id !== user.id && user.role !== 'master_admin')) {
      return fail(403, { error: 'Access denied' });
    }

    await supabaseAdmin.from('mood_entries').delete().eq('id', params.id);
    throw redirect(303, '/today');
  }
};
