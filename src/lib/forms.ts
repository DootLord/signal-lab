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
