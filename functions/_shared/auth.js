const COOKIE = 'tems_admin_session';
const encoder = new TextEncoder();

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

export async function makeSession(secret) {
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })));
  return `${payload}.${await sign(payload, secret)}`;
}

export async function isAuthenticated(request, secret) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return false;
  const [payload, signature] = match[1].split('.');
  if (!payload || !signature || signature !== await sign(payload, secret)) return false;
  try { return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).exp > Date.now(); }
  catch { return false; }
}

export function sessionCookie(token, secure = true) {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=28800`;
}
export function clearSessionCookie() { return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=0`; }
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
}
