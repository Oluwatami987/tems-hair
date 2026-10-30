import { clearSessionCookie, isAuthenticated, json } from '../../_shared/auth.js';

export async function onRequestGet({ request, env }) {
  return json({ authenticated: await isAuthenticated(request, env.SESSION_SECRET) });
}

export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}
