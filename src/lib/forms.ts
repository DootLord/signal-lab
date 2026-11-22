import { kinds, normalizeTag, type Kind, type ToolInput } from './db.ts';

export type FormResult = { ok: true; value: ToolInput } | { ok: false; errors: string[]; value: Partial<ToolInput> };

function text(form: FormData, name: string, max: number) {
  return String(form.get(name) ?? '').replace(/\r\n/g, '\n').trim().slice(0, max);
}

function url(raw: string) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

export type ImportResult = { cards: (ToolInput & { foundVia: string | null; foundNote: string | null })[]; errors: string[] };

/**
 * Parses pasted import JSON: an array of cards, or { cards: [...] }.
 * Each card uses the same fields as the editor, plus optional foundVia / foundNote.
 */
export function parseImport(raw: string): ImportResult {
  const errors: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { cards: [], errors: ['That isn’t valid JSON.'] };
  }
  const list = Array.isArray(data) ? data : (data as { cards?: unknown })?.cards;
  if (!Array.isArray(list)) return { cards: [], errors: ['Expected a list of cards, or an object with a "cards" list.'] };
  if (list.length > 50) return { cards: [], errors: ['Import at most 50 cards at a time.'] };

  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim().slice(0, max) : '');
  const cards: ImportResult['cards'] = [];
  list.forEach((item, i) => {
    const c = (item ?? {}) as Record<string, unknown>;
    const label = str(c.name, 80) || `Card ${i + 1}`;
    const links = { website: url(str(c.website, 500)), repo: url(str(c.repo, 500)), docs: url(str(c.docs, 500)), foundVia: url(str(c.foundVia, 500)) };
    const card = {
      name: str(c.name, 80), tagline: str(c.tagline, 200), description: str(c.description, 2000),
      replaces: str(c.replaces, 300), useWhen: str(c.useWhen, 600), tryIt: str(c.tryIt, 1500),
      kind: (kinds.includes(c.kind as Kind) ? c.kind : 'gem') as Kind,
      tags: [...new Set((Array.isArray(c.tags) ? c.tags : []).map((t) => normalizeTag(String(t))).filter(Boolean))].slice(0, 8),
      website: links.website ?? null, repo: links.repo ?? null, docs: links.docs ?? null,
      foundVia: links.foundVia ?? null, foundNote: str(c.foundNote, 600) || null,
    };
    const problems = [
      !card.name && 'a name', !card.tagline && 'a tagline', !card.description && 'a description', !card.tags.length && 'a tag',
      !card.website && !card.repo && 'a website or repo link',
      Object.values(links).some((v) => v === undefined) && 'valid http(s) links',
    ].filter(Boolean);
    if (problems.length) errors.push(`${label}: needs ${problems.join(', ')}.`);
    else cards.push(card);
  });
  return { cards, errors };
}

export function parseToolForm(form: FormData): FormResult {
  const errors: string[] = [];
  const kind = text(form, 'kind', 10) as Kind;
  const links = { website: url(text(form, 'website', 500)), repo: url(text(form, 'repo', 500)), docs: url(text(form, 'docs', 500)) };
  const value = {
    name: text(form, 'name', 80),
    tagline: text(form, 'tagline', 200),
    description: text(form, 'description', 2000),
    replaces: text(form, 'replaces', 300),
    useWhen: text(form, 'useWhen', 600),
    tryIt: text(form, 'tryIt', 1500),
    kind: kinds.includes(kind) ? kind : 'gem',
    tags: [...new Set(text(form, 'tags', 300).split(',').map(normalizeTag).filter(Boolean))].slice(0, 8),
    website: links.website ?? null,
    repo: links.repo ?? null,
    docs: links.docs ?? null,
  };
  if (!value.name) errors.push('Name is required.');
  if (!value.tagline) errors.push('Tagline is required.');
  if (!value.description) errors.push('Description is required.');
  if (!value.tags.length) errors.push('Add at least one tag.');
  for (const [field, v] of Object.entries(links)) if (v === undefined) errors.push(`The ${field} link must be a full http(s) URL.`);
  if (!value.website && !value.repo) errors.push('Add a website or a repository link.');
  return errors.length ? { ok: false, errors, value } : { ok: true, value };
}
