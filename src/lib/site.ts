// The public address of the site. Behind Coolify's proxy the request URL is
// http://localhost, so absolute links (canonical, Open Graph, RSS, sitemap) must
// come from here, never from Astro.url.
export const SITE_URL = (process.env.SITE_URL || 'https://signal-lab.fyi').replace(/\/+$/, '');
export const SITE_NAME = 'Signal Lab';
export const AUTHOR = { name: 'DootLord', url: 'https://dootlord.meme' };

/** Absolute URL for a site path, e.g. abs('/tools/fzf'). */
export const abs = (path: string) => SITE_URL + (path.startsWith('/') ? path : '/' + path);

/** Path of a topic's landing page. */
export const topicPath = (tag: string) => `/topics/${encodeURIComponent(tag)}`;

/** Shortens text to a meta-description length, cutting at a word boundary. */
export function clip(text: string, max = 158) {
  const flat = text.replace(/\s+/g, ' ').replace(/`/g, '').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.–-]+$/, '') + '…';
}

/** Serialises JSON-LD safely for a <script> tag. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: abs(item.path) })),
});
