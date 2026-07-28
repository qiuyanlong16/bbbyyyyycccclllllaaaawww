export async function onRequest(context) {
  // This function enables Cloudflare Pages Functions for this project
  // It handles requests that are not static files
  return new Response('Not found', { status: 404 });
}
