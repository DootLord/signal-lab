import type { APIRoute } from 'astro';
import { listPublished } from '../lib/db.ts';
import { abs, topicPath } from '../lib/site.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const day = (iso: string) => iso.slice(0, 10);

// Every indexable page: the hub pages, each published tool, and each topic page
// with at least two tools (single-tool topics are marked noindex).
export const GET: APIRoute = () => {
  const { tools } = listPublished({ limit: 100_000 });
  const latest = tools.reduce((max, t) => (t.updatedAt > max ? t.updatedAt : max), '1970-01-01');

  const topics = new Map<string, { count: number; lastmod: string }>();
  for (const t of tools) {
    for (const tag of t.tags) {
      const entry = topics.get(tag) ?? { count: 0, lastmod: '1970-01-01' };
      entry.count += 1;
      if (t.updatedAt > entry.lastmod) entry.lastmod = t.updatedAt;
      topics.set(tag, entry);
    }
  }

  const urls: { loc: string; lastmod: string }[] = [
    { loc: '/', lastmod: latest },
    { loc: '/browse', lastmod: latest },
    { loc: '/browse?kind=gem', lastmod: latest },
    { loc: '/browse?kind=new', lastmod: latest },
    { loc: '/topics', lastmod: latest },
    { loc: '/about', lastmod: latest },
    ...[...topics.entries()].filter(([, v]) => v.count > 1).map(([tag, v]) => ({ loc: topicPath(tag), lastmod: v.lastmod })),
    ...tools.map((t) => ({ loc: `/tools/${t.slug}`, lastmod: t.updatedAt })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(abs(u.loc))}</loc><lastmod>${day(u.lastmod)}</lastmod></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
