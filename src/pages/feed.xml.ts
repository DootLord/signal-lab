import type { APIRoute } from 'astro';
import { listPublished } from '../lib/db.ts';

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const GET: APIRoute = ({ url }) => {
  const origin = url.origin;
  const items = listPublished({ limit: 50 }).tools.map((t) => `
    <item>
      <title>${esc(`${t.name}: ${t.tagline}`)}</title>
      <link>${origin}/tools/${t.slug}</link>
      <guid isPermaLink="true">${origin}/tools/${t.slug}</guid>
      <pubDate>${new Date(t.publishedAt ?? t.createdAt).toUTCString()}</pubDate>
      <description>${esc(t.description)}</description>
      ${t.tags.map((tag) => `<category>${esc(tag)}</category>`).join('')}
    </item>`).join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Signal Lab</title>
    <link>${origin}/</link>
    <description>New developer tools and the gems you may have missed.</description>${items}
  </channel>
</rss>`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=900' } });
};
