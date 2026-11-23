import type { APIRoute } from 'astro';
import { abs } from '../lib/site.ts';

// Search results and admin pages also carry a noindex tag; blocking them here
// saves crawl budget for the tool and topic pages.
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /admin
Disallow: /browse?q=
Disallow: /browse?*&q=
Disallow: /tools/*/vote

Sitemap: ${abs('/sitemap.xml')}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } },
  );
