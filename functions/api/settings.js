import { json } from '../_shared/auth.js';
export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'booking_rules'").first();
  return json({ bookingRules: row?.value || '' });
}
