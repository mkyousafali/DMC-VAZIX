import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import type { MoodEntry } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
  requireAuth(locals.user);
  const user = locals.user;

  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabaseAdmin
    .from('mood_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .order('entry_time', { ascending: false });

  return { entries: (data ?? []) as MoodEntry[], user, today };
};
