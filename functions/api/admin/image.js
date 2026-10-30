import { isAuthenticated, json } from '../../_shared/auth.js';

export async function onRequestPost({ request, env }) {
  if (!await isAuthenticated(request, env.SESSION_SECRET)) return json({ error: 'Sign in to upload product photos.' }, 401);
  if (!env.PRODUCT_IMAGES) return json({ error: 'Product photo storage is not configured.' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid photo upload.' }, 400); }
  const match = String(body.image || '').match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return json({ error: 'Choose a JPEG, PNG, or WebP image.' }, 400);
  const binary = atob(match[2]);
  if (binary.length > 500 * 1024) return json({ error: 'Photo must be under 500 KB after resizing.' }, 413);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  const key = `${crypto.randomUUID()}.${extension}`;
  await env.PRODUCT_IMAGES.put(key, bytes, { httpMetadata: { contentType: `image/${match[1]}`, cacheControl: 'public, max-age=31536000, immutable' } });
  return json({ image: `/api/images/${key}` });
}
