import { isAuthenticated, json } from '../../_shared/auth.js';
export async function onRequestPut({ request, env }) {
  if (!await isAuthenticated(request, env.SESSION_SECRET)) return json({ error: 'Sign in to manage settings.' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid settings.' }, 400); }
  if (typeof body.bookingRules !== 'string' || body.bookingRules.length > 5000) return json({ error: 'Rules must be 5,000 characters or fewer.' }, 400);
  await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('booking_rules', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(body.bookingRules.trim()).run();
  return json({ ok: true });
}
