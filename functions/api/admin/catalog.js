import { isAuthenticated, json } from '../../_shared/auth.js';

export async function onRequestPut({ request, env }) {
  if (!await isAuthenticated(request, env.SESSION_SECRET)) return json({ error: 'Sign in to manage the catalog.' }, 401);
  let products;
  try { products = (await request.json()).products; } catch { return json({ error: 'Invalid catalog data.' }, 400); }
  if (!Array.isArray(products) || products.length > 200) return json({ error: 'Catalog must contain at most 200 products.' }, 400);
  const ids = new Set();
  for (const item of products) {
    if (!item || !/^[a-zA-Z0-9_-]{1,80}$/.test(item.id) || ids.has(item.id) || !['extensions', 'ponytails'].includes(item.category) || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 70 || !Number.isSafeInteger(Number(item.price)) || Number(item.price) < 0 || !Array.isArray(item.colors) || item.colors.length > 30 || typeof item.image !== 'string' || item.image.length > 700000 || !(/^(https:\/\/|\/?assets\/|\/?api\/images\/)/i.test(item.image))) return json({ error: 'One or more product entries are invalid. Use HTTPS photo links, uploaded photos, or existing assets.' }, 400);
    ids.add(item.id);
  }
  const batch = [env.DB.prepare('DELETE FROM products')];
  for (const item of products) batch.push(env.DB.prepare('INSERT INTO products (id, category, name, type, detail, price, colors, image, available, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)').bind(item.id, item.category, item.name.trim(), String(item.type || ''), String(item.detail || ''), Number(item.price), JSON.stringify(item.colors.map(String)), item.image, item.available === false ? 0 : 1));
  await env.DB.batch(batch);
  return json({ ok: true, count: products.length });
}
