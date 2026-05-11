// src/hooks.server.ts — Run on every request to populate locals.user
import type { Handle } from '@sveltejs/kit';
import { verifySessionToken, SESSION_COOKIE } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(SESSION_COOKIE);

  if (token) {
    const user = await verifySessionToken(token);
    event.locals.user = user;
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
