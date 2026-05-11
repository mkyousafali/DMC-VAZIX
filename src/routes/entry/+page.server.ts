import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import { parseTags } from '$lib/utils';
import type { SavedNote } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
  requireAuth(locals.user);
  const user = locals.user;

  const { data: notes } = await supabaseAdmin
    .from('saved_notes')
    .select('*')
    .eq('user_id', user.id)
    .order('use_count', { ascending: false });

  return { user, notes: (notes ?? []) as SavedNote[] };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    requireAuth(locals.user);
    const user = locals.user;

    const form = await request.formData();

    const entry_date     = String(form.get('entry_date') ?? '');
    const entry_time     = String(form.get('entry_time') ?? '');
    const mood_rating    = form.get('mood_rating')    ? Number(form.get('mood_rating'))    : null;
    const sleep_hours    = form.get('sleep_hours')    ? Number(form.get('sleep_hours'))    : null;
    const anxiety_rating = form.get('anxiety_rating') ? Number(form.get('anxiety_rating')) : null;
    const energy_rating  = form.get('energy_rating')  ? Number(form.get('energy_rating'))  : null;
    const stress_rating  = form.get('stress_rating')  ? Number(form.get('stress_rating'))  : null;
    const pain_rating    = form.get('pain_rating')    ? Number(form.get('pain_rating'))    : null;
    const activity        = String(form.get('activity') ?? '').trim() || null;
    const medication_note = String(form.get('medication_note') ?? '').trim() || null;
    const trigger_event   = String(form.get('trigger_event') ?? '').trim() || null;
    const general_note    = String(form.get('general_note') ?? '').trim() || null;
    const tags_raw        = String(form.get('tags') ?? '').trim();
    const tags            = parseTags(tags_raw);

    if (!entry_date) return fail(400, { error: 'Date is required.' });
    if (!entry_time) return fail(400, { error: 'Time is required.' });

    const { error } = await supabaseAdmin.from('mood_entries').insert({
      user_id: user.id,
      entry_date,
      entry_time,
      mood_rating,
      sleep_hours,
      anxiety_rating,
      energy_rating,
      stress_rating,
      pain_rating,
      activity,
      medication_note,
      trigger_event,
      general_note,
      tags
    });

    if (error) {
      console.error('Insert error:', error);
      return fail(500, { error: 'Failed to save entry. Please try again.' });
    }

    return { success: true };
  }
};
