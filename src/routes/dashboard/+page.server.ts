import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import { avg, round1 } from '$lib/utils';
import type { MoodEntry, DailySummary } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
  requireAuth(locals.user);
  const user = locals.user;

  const today = new Date().toISOString().slice(0, 10);

  // Today's entries
  const { data: todayEntries } = await supabaseAdmin
    .from('mood_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .order('entry_time', { ascending: false });

  const entries: MoodEntry[] = todayEntries ?? [];

  // Last 7 days trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = sevenDaysAgo.toISOString().slice(0, 10);

  const { data: trendData } = await supabaseAdmin
    .from('mood_entries')
    .select('entry_date, mood_rating, anxiety_rating, energy_rating, stress_rating, pain_rating, sleep_hours')
    .eq('user_id', user.id)
    .gte('entry_date', fromDate)
    .lte('entry_date', today)
    .order('entry_date', { ascending: true });

  // Compute daily summaries for chart
  const byDate: Record<string, typeof trendData> = {};
  for (const row of trendData ?? []) {
    if (!byDate[row.entry_date]) byDate[row.entry_date] = [];
    byDate[row.entry_date]!.push(row);
  }

  const trend: DailySummary[] = Object.entries(byDate).map(([date, rows]) => ({
    date,
    count: rows!.length,
    avg_mood:    avg(rows!.map((r) => r.mood_rating)),
    min_mood:    rows!.reduce((m, r) => r.mood_rating !== null ? Math.min(m, r.mood_rating) : m, 10) ?? null,
    max_mood:    rows!.reduce((m, r) => r.mood_rating !== null ? Math.max(m, r.mood_rating) : m, 1)  ?? null,
    avg_anxiety: avg(rows!.map((r) => r.anxiety_rating)),
    avg_energy:  avg(rows!.map((r) => r.energy_rating)),
    avg_stress:  avg(rows!.map((r) => r.stress_rating)),
    avg_pain:    avg(rows!.map((r) => r.pain_rating)),
    sleep_hours: rows!.find((r) => r.sleep_hours !== null)?.sleep_hours ?? null
  }));

  // Today stats
  const todayMoods = entries.map((e) => e.mood_rating).filter((r): r is number => r !== null);
  const stats = {
    avg_mood:    round1(avg(todayMoods)),
    min_mood:    todayMoods.length ? Math.min(...todayMoods) : null,
    max_mood:    todayMoods.length ? Math.max(...todayMoods) : null,
    count:       entries.length,
    sleep_hours: entries.find((e) => e.sleep_hours !== null)?.sleep_hours ?? null,
    avg_anxiety: round1(avg(entries.map((e) => e.anxiety_rating)))
  };

  return { user, entries: entries.slice(0, 5), stats, trend };
};
