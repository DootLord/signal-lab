import type { APIRoute } from 'astro';
import { listPublished } from '../lib/db.ts';
import { abs } from '../lib/site.ts';

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const GET: APIRoute = () => {
  const { tools } = listPublished({ limit: 50 });
  const items = tools.map((t) => `
    <item>
      <title>${esc(`${t.name}: ${t.tagline}`)}</title>
      <link>${abs(`/tools/${t.slug}`)}</link>
      <guid isPermaLink="true">${abs(`/tools/${t.slug}`)}</guid>
      <pubDate>${new Date(t.publishedAt ?? t.createdAt).toUTCString()}</pubDate>
      <description>${esc(t.description)}</description>
      ${t.tags.map((tag) => `<category>${esc(tag)}</category>`).join('')}
    </item>`).join('');
  const built = tools[0] ? new Date(tools[0].publishedAt ?? tools[0].createdAt) : new Date();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Signal Lab: new developer tools</title>
    <link>${abs('/')}</link>
    <atom:link href="${abs('/feed.xml')}" rel="self" type="application/rss+xml" />
    <description>Developer tools worth knowing: what’s new and moving, and the established gems you may have missed. Every tool reviewed by hand.</description>
    <language>en</language>
    <lastBuildDate>${built.toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=900' } });
};
