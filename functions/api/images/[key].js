export async function onRequestGet({ params, env }) {
  const key = String(params.key || '');
  if (!/^[a-f0-9-]{36}\.(?:jpg|png|webp)$/.test(key)) return new Response('Not found', { status: 404 });
  const object = await env.PRODUCT_IMAGES.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}
