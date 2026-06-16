// Cloudflare Pages Function: /api/data
// KV namespace: TRACKER_DATA (bind in Pages settings)

const ADMIN_PASS = 'odemark2025';
const KV_KEY = 'tracker_db';

export async function onRequest(context) {
  const { request, env } = context;
  const kv = env.TRACKER_DATA;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pass',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // GET — load data (public, no auth needed)
  if (request.method === 'GET') {
    try {
      const data = await kv.get(KV_KEY);
      return new Response(data || 'null', { headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // POST — save data (requires admin password)
  if (request.method === 'POST') {
    const pass = request.headers.get('X-Admin-Pass');
    if (pass !== ADMIN_PASS) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    try {
      const body = await request.text();
      JSON.parse(body); // validate JSON
      await kv.put(KV_KEY, body);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}
