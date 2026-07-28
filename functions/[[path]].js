export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Proxy /api/* and /health to backend
  if (path.startsWith('/api/') || path === '/health') {
    // BACKEND_URL should be set in Cloudflare Pages environment variables
    // e.g. https://api.byclaw.help (through Cloudflare Tunnel)
    const backendBase = context.env.BACKEND_URL || 'http://10.10.10.1:8800';
    const backendUrl = backendBase.replace(/\/$/, '') + path + url.search;

    // Handle CORS preflight
    if (context.request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const proxyReq = new Request(backendUrl, {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
      redirect: 'manual',
    });

    try {
      const response = await fetch(proxyReq);
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Backend unavailable', detail: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // For all other paths, let Pages handle it
  return context.next();
}
