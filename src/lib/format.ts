const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function timeAgo(iso: string | null | undefined) {
  if (!iso) return '';
  const days = Math.round((Date.parse(iso) - Date.now()) / 86_400_000);
  if (days > -1) return 'today';
  if (days > -30) return rtf.format(days, 'day');
  if (days > -365) return rtf.format(Math.round(days / 30), 'month');
  return rtf.format(Math.round(days / 365), 'year');
}

export function formatDate(iso: string | null | undefined) {
  return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';
}

export function host(url: string) {
  try { return new URL(url).host.replace(/^www\./, ''); } catch { return url; }
}

/** Stable hue (0-359) for a name, used to colour monograms. */
export function hue(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

const LABELS: Record<string, string> = {
  ai: 'AI', api: 'API', ci: 'CI', cli: 'CLI', llm: 'LLM', http: 'HTTP', https: 'HTTPS', sqlite: 'SQLite',
  devops: 'DevOps', javascript: 'JavaScript', typescript: 'TypeScript', 'github-actions': 'GitHub Actions',
  go: 'Go', golang: 'Go', 'c#': 'C#', 'c++': 'C++', graphql: 'GraphQL', postgres: 'Postgres', mcp: 'MCP',
};

/** Human-readable topic name: "cli" → "CLI", "local-dev" → "Local dev". */
export function topicLabel(tag: string) {
  if (LABELS[tag]) return LABELS[tag];
  const words = tag.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function plural(n: number, one: string, many = one + 's') {
  return `${n.toLocaleString('en')} ${n === 1 ? one : many}`;
}
