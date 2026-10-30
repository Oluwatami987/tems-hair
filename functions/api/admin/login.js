import { json, makeSession, sessionCookie } from '../../_shared/auth.js';

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PIN || !/^\d{6,12}$/.test(env.ADMIN_PIN) || !env.SESSION_SECRET || !env.DB) return json({ error: 'Admin sign-in is not configured. Set a 6–12 digit admin PIN and session secret.' }, 503);
  const state = await env.DB.prepare('SELECT failed_count, blocked_until FROM admin_login_attempts WHERE id = 1').first();
  const now = Math.floor(Date.now() / 1000);
  if (state?.blocked_until > now) return json({ error: 'Too many attempts. Try again later.' }, 429);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Enter your PIN.' }, 400); }
  const pin = String(body.pin || '');
  const digest = async value => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  const [given, expected] = await Promise.all([digest(pin), digest(env.ADMIN_PIN)]);
  const valid = given.every((byte, index) => byte === expected[index]) && pin.length === env.ADMIN_PIN.length;
  if (!valid) {
    const failures = (state?.failed_count || 0) + 1;
    await env.DB.prepare('UPDATE admin_login_attempts SET failed_count = ?, blocked_until = ? WHERE id = 1').bind(failures >= 5 ? 0 : failures, failures >= 5 ? now + 15 * 60 : 0).run();
    return json({ error: failures >= 5 ? 'Too many attempts. Try again in 15 minutes.' : 'That PIN is not correct.' }, 401);
  }
  await env.DB.prepare('UPDATE admin_login_attempts SET failed_count = 0, blocked_until = 0 WHERE id = 1').run();
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(await makeSession(env.SESSION_SECRET)) });
}
