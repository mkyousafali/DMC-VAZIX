import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import type { AuditLog } from '$lib/types';

export const load: PageServerLoad = async ({ locals, url }) => {
  requireAdmin(locals.user);

  const page     = Number(url.searchParams.get('page') ?? '1');
  const limit    = 50;
  const offset   = (page - 1) * limit;
  const action   = url.searchParams.get('action') ?? '';
  const username = url.searchParams.get('username') ?? '';

  let query = supabaseAdmin
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (action)   query = query.eq('action', action);
  if (username) query = query.eq('actor_username', username);

  const { data, count } = await query;

  return {
    logs: (data ?? []) as AuditLog[],
    total: count ?? 0,
    page,
    limit,
    user: locals.user
  };
};
