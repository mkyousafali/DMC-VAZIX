import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import type { MoodEntry, AppUser } from '$lib/types';
import { daysAgo } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
  requireAuth(locals.user);
  const user = locals.user;

  // Admin can export any user; regular users export themselves
  const targetUserId = user.role === 'master_admin'
    ? (url.searchParams.get('user_id') ?? user.id)
    : user.id;

  const startDate = url.searchParams.get('start') ?? daysAgo(29);
  const endDate   = url.searchParams.get('end')   ?? new Date().toISOString().slice(0, 10);

  const { data: entries } = await supabaseAdmin
    .from('mood_entries')
    .select('*')
    .eq('user_id', targetUserId)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: true })
    .order('entry_time', { ascending: true });

  // Load target user info
  const { data: targetUser } = await supabaseAdmin
    .from('app_users')
    .select('id, username, display_name')
    .eq('id', targetUserId)
    .single();

  // For master_admin: load list of all users for dropdown
  let users: Pick<AppUser, 'id' | 'username' | 'display_name'>[] = [];
  if (user.role === 'master_admin') {
    const { data: allUsers } = await supabaseAdmin
      .from('app_users')
      .select('id, username, display_name')
      .eq('is_active', true)
      .order('username');
    users = allUsers ?? [];
  }

  return {
    entries: (entries ?? []) as MoodEntry[],
    targetUser: targetUser as Pick<AppUser, 'id' | 'username' | 'display_name'>,
    startDate,
    endDate,
    users,
    user
  };
};
