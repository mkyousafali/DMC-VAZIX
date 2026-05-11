import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE } from '$lib/server/session';
import { auditLog, getClientIP } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies, locals, request }) => {
  if (locals.user) {
    await auditLog({
      actor_id: locals.user.id,
      actor_username: locals.user.username,
      action: 'logout',
      ip_address: getClientIP(request)
    });
  }
  cookies.delete(SESSION_COOKIE, { path: '/' });
  throw redirect(303, '/login');
};
