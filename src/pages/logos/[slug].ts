import type { APIRoute } from 'astro';
import { getLogoBySlug } from '../../lib/db.ts';

// Serves the stored copy of a tool's logo. The bytes come from third-party sites,
// so the type is the one sniffed when it was saved, and SVGs are sandboxed in
// case someone opens one directly (inside <img> they can't run scripts anyway).
export const GET: APIRoute = ({ params, locals, url }) => {
  const logo = getLogoBySlug(params.slug ?? '');
  if (!logo || (logo.status !== 'published' && !locals.admin)) return new Response(null, { status: 404 });
  const versioned = logo.status === 'published' && url.searchParams.has('v');
  return new Response(new Uint8Array(logo.data), {
    headers: {
      'Content-Type': logo.mime,
      'Cache-Control': versioned ? 'public, max-age=2592000, immutable' : 'private, max-age=300',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
};
