import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import type { MoodEntry } from '$lib/types';

export const load: PageServerLoad = async ({ locals, url }) => {
  requireAuth(locals.user);
  const user = locals.user;

  const today = new Date().toISOString().slice(0, 10);
  const thirtyAgo = new Date();
  thirtyAgo.setDate(thirtyAgo.getDate() - 29);

  const startDate = url.searchParams.get('start') ?? thirtyAgo.toISOString().slice(0, 10);
  const endDate   = url.searchParams.get('end')   ?? today;
  const search    = url.searchParams.get('q')     ?? '';
  const minMood   = url.searchParams.get('min_mood') ? Number(url.searchParams.get('min_mood')) : null;
  const maxMood   = url.searchParams.get('max_mood') ? Number(url.searchParams.get('max_mood')) : null;
  const tag       = url.searchParams.get('tag')   ?? '';

  let query = supabaseAdmin
    .from('mood_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: false })
    .order('entry_time', { ascending: false });

  if (minMood !== null) query = query.gte('mood_rating', minMood);
  if (maxMood !== null) query = query.lte('mood_rating', maxMood);
  if (tag)              query = query.contains('tags', [tag]);

  const { data } = await query;
  let entries: MoodEntry[] = (data ?? []) as MoodEntry[];

  // Client-side text search (Supabase free plan doesn't include full-text search)
  if (search) {
    const q = search.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.general_note?.toLowerCase().includes(q) ||
        e.trigger_event?.toLowerCase().includes(q) ||
        e.activity?.toLowerCase().includes(q) ||
        e.medication_note?.toLowerCase().includes(q) ||
        e.tags.some((t) => t.includes(q))
    );
  }

  return { entries, startDate, endDate, search, minMood, maxMood, tag, user };
};
