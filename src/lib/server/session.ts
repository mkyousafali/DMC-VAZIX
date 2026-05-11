// ── Server-only: JWT session management ──────────────────────────────────
// Sessions are stored as signed JWTs in httpOnly cookies.
// The SESSION_SECRET is never exposed to the browser.

import { SignJWT, jwtVerify } from 'jose';
import { SESSION_SECRET } from '$env/static/private';
import type { SessionUser } from '$lib/types';

const secret = new TextEncoder().encode(SESSION_SECRET);
const ALG = 'HS256';

export const SESSION_COOKIE = 'dmc_session';
const SESSION_EXPIRY = '30d';

/** Create a signed JWT for the given user */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
    display_name: user.display_name
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(secret);
}

/** Verify a JWT and return the session user, or null if invalid/expired */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload['id'] as string,
      username: payload['username'] as string,
      role: payload['role'] as SessionUser['role'],
      display_name: (payload['display_name'] as string | null) ?? null
    };
  } catch {
    return null;
  }
}

/** Cookie options for setting the session cookie */
export const cookieOptions = (secure: boolean) => ({
  httpOnly: true,
  secure,
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days — persistent across browser restarts
  path: '/'
});
