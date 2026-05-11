// ── Server-only: Auth helpers & audit logging ─────────────────────────────
import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import type { SessionUser, UserRole } from '$lib/types';

/** Require authentication — redirect to /login if not logged in */
export function requireAuth(user: SessionUser | null): asserts user is SessionUser {
  if (!user) {
    throw redirect(303, '/login');
  }
}

/** Require master_admin or admin role */
export function requireAdmin(user: SessionUser | null): asserts user is SessionUser {
  requireAuth(user);
  if (user.role !== 'master_admin' && user.role !== 'admin') {
    throw redirect(303, '/dashboard');
  }
}

/** Require master_admin role */
export function requireMasterAdmin(user: SessionUser | null): asserts user is SessionUser {
  requireAuth(user);
  if (user.role !== 'master_admin') {
    throw redirect(303, '/dashboard');
  }
}

/** Log an action to the audit_log table */
export async function auditLog(opts: {
  actor_id: string | null;
  actor_username: string | null;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string | null;
}) {
  await supabaseAdmin.from('audit_log').insert({
    actor_id: opts.actor_id,
    actor_username: opts.actor_username,
    action: opts.action,
    target_type: opts.target_type ?? null,
    target_id: opts.target_id ?? null,
    details: opts.details ?? null,
    ip_address: opts.ip_address ?? null
  });
}

/** Get client IP from request headers */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** Validate that a string is a 6-digit numeric access code */
export function isValidAccessCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

/** Validate username: 3-30 chars, alphanumeric + underscore */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username.trim());
}
