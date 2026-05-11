import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
  requireAdmin(locals.user);

  const [usersRes, entriesRes, auditRes] = await Promise.all([
    supabaseAdmin.from('app_users').select('count', { count: 'exact', head: true }),
    supabaseAdmin.from('mood_entries').select('count', { count: 'exact', head: true }),
    supabaseAdmin.from('audit_log').select('id, actor_username, action, created_at').order('created_at', { ascending: false }).limit(10)
  ]);

  // Today's entries count
  const today = new Date().toISOString().slice(0, 10);
  const { count: todayCount } = await supabaseAdmin
    .from('mood_entries')
    .select('count', { count: 'exact', head: true })
    .eq('entry_date', today);

  return {
    user: locals.user,
    stats: {
      totalUsers: usersRes.count ?? 0,
      totalEntries: entriesRes.count ?? 0,
      todayEntries: todayCount ?? 0
    },
    recentAudit: auditRes.data ?? []
  };
};
