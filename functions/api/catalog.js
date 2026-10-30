import { json } from '../_shared/auth.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT id, category, name, type, detail, price, colors, image, available FROM products ORDER BY category, name').all();
  const products = results.map(row => ({ ...row, colors: JSON.parse(row.colors), available: Boolean(row.available) }));
  return json({ products });
}
