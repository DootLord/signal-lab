// Data layer. Deliberately has no npm imports so scripts/scan.ts can use it
// directly with Node's built-in TypeScript support.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { seedTools } from './seed.ts';

export const kinds = ['new', 'gem'] as const;
export type Kind = (typeof kinds)[number];
export const statuses = ['published', 'pending', 'rejected'] as const;
export type Status = (typeof statuses)[number];

export type ToolInput = {
  name: string;
  tagline: string;
  description: string;
  replaces: string;
  useWhen: string;
  tryIt: string;
  kind: Kind;
  tags: string[];
  website: string | null;
  repo: string | null;
  docs: string | null;
  foundVia?: string | null;
  foundNote?: string | null;
};

export type Tool = ToolInput & {
  id: number;
  slug: string;
  status: Status;
  createdAt: string;
  publishedAt: string | null;
  updatedAt: string;
};

type Row = {
  id: number; slug: string; name: string; tagline: string; description: string;
  replaces: string; use_when: string; try_it: string; kind: Kind; status: Status;
  website: string | null; repo: string | null; docs: string | null;
  found_via: string | null; found_note: string | null;
  created_at: string; published_at: string | null; updated_at: string; tags: string | null;
};

const migrations = [
  `CREATE TABLE tools (
     id INTEGER PRIMARY KEY,
     slug TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL,
     tagline TEXT NOT NULL,
     description TEXT NOT NULL,
     replaces TEXT NOT NULL DEFAULT '',
     use_when TEXT NOT NULL DEFAULT '',
     try_it TEXT NOT NULL DEFAULT '',
     kind TEXT NOT NULL CHECK (kind IN ('new','gem')),
     status TEXT NOT NULL CHECK (status IN ('published','pending','rejected')),
     website TEXT, repo TEXT, docs TEXT,
     found_via TEXT, found_note TEXT,
     created_at TEXT NOT NULL, published_at TEXT, updated_at TEXT NOT NULL
   );
   CREATE TABLE tool_tags (
     tool_id INTEGER NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
     tag TEXT NOT NULL,
     PRIMARY KEY (tool_id, tag)
   );
   CREATE INDEX tool_tags_tag ON tool_tags(tag);
   CREATE INDEX tools_status_published ON tools(status, published_at);
   CREATE TABLE scan_runs (
     id INTEGER PRIMARY KEY,
     started_at TEXT NOT NULL,
     finished_at TEXT,
     candidates INTEGER NOT NULL DEFAULT 0,
     suggested INTEGER NOT NULL DEFAULT 0,
     error TEXT
   );`,
];

let db: DatabaseSync | undefined;

export function getDb(): DatabaseSync {
  if (db) return db;
  const path = resolve(process.env.DATABASE_PATH || './data/signal-lab.sqlite');
  mkdirSync(dirname(path), { recursive: true });
  db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;');
  const { user_version: version } = db.prepare('PRAGMA user_version').get() as { user_version: number };
  for (let i = version; i < migrations.length; i++) {
    db.exec('BEGIN');
    try {
      db.exec(migrations[i]);
      db.exec(`PRAGMA user_version = ${i + 1}`);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM tools').get() as { n: number };
  if (n === 0) for (const tool of seedTools) createTool(tool, 'published');
  return db;
}

const now = () => new Date().toISOString();

export function slugify(name: string) {
  return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'tool';
}

export function normalizeTag(tag: string) {
  return tag.toLowerCase().trim().replace(/[^a-z0-9+#.]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
}

/** Canonical form of a URL for duplicate detection. */
export function normalizeUrl(url: string) {
  try {
    const u = new URL(url);
    u.hash = '';
    u.hostname = u.hostname.replace(/^www\./, '');
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|ref$|source$)/.test(k)) u.searchParams.delete(k);
    return (u.hostname + u.pathname).replace(/\/$/, '').replace(/\.git$/, '').toLowerCase() + u.search;
  } catch {
    return url.toLowerCase();
  }
}

const SELECT = `SELECT t.*, (SELECT group_concat(tag, ',') FROM tool_tags WHERE tool_id = t.id) AS tags FROM tools t`;

function toTool(r: Row): Tool {
  return {
    id: r.id, slug: r.slug, name: r.name, tagline: r.tagline, description: r.description,
    replaces: r.replaces, useWhen: r.use_when, tryIt: r.try_it, kind: r.kind, status: r.status,
    website: r.website, repo: r.repo, docs: r.docs, foundVia: r.found_via, foundNote: r.found_note,
    createdAt: r.created_at, publishedAt: r.published_at, updatedAt: r.updated_at,
    tags: r.tags ? r.tags.split(',').sort() : [],
  };
}

function uniqueSlug(name: string, excludeId?: number) {
  const base = slugify(name);
  let slug = base;
  for (let i = 2; ; i++) {
    const hit = getDb().prepare('SELECT id FROM tools WHERE slug = ?').get(slug) as { id: number } | undefined;
    if (!hit || hit.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
}

function setTags(id: number, tags: string[]) {
  const d = getDb();
  d.prepare('DELETE FROM tool_tags WHERE tool_id = ?').run(id);
  const insert = d.prepare('INSERT OR IGNORE INTO tool_tags (tool_id, tag) VALUES (?, ?)');
  for (const tag of tags.map(normalizeTag).filter(Boolean).slice(0, 8)) insert.run(id, tag);
}

export function createTool(input: ToolInput, status: Status): Tool {
  const d = getDb();
  const ts = now();
  const result = d.prepare(
    `INSERT INTO tools (slug, name, tagline, description, replaces, use_when, try_it, kind, status,
       website, repo, docs, found_via, found_note, created_at, published_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    uniqueSlug(input.name), input.name, input.tagline, input.description, input.replaces, input.useWhen,
    input.tryIt, input.kind, status, input.website, input.repo, input.docs, input.foundVia ?? null,
    input.foundNote ?? null, ts, status === 'published' ? ts : null, ts,
  );
  const id = Number(result.lastInsertRowid);
  setTags(id, input.tags);
  return getToolById(id)!;
}

export function updateTool(id: number, input: ToolInput): Tool | undefined {
  const existing = getToolById(id);
  if (!existing) return undefined;
  getDb().prepare(
    `UPDATE tools SET slug = ?, name = ?, tagline = ?, description = ?, replaces = ?, use_when = ?, try_it = ?,
       kind = ?, website = ?, repo = ?, docs = ?, updated_at = ? WHERE id = ?`,
  ).run(
    existing.name === input.name ? existing.slug : uniqueSlug(input.name, id), input.name, input.tagline,
    input.description, input.replaces, input.useWhen, input.tryIt, input.kind, input.website, input.repo,
    input.docs, now(), id,
  );
  setTags(id, input.tags);
  return getToolById(id);
}

export function setStatus(id: number, status: Status) {
  getDb().prepare(
    `UPDATE tools SET status = ?, updated_at = ?,
       published_at = CASE WHEN ? = 'published' THEN coalesce(published_at, ?) ELSE published_at END
     WHERE id = ?`,
  ).run(status, now(), status, now(), id);
}

export function deleteTool(id: number) {
  getDb().prepare('DELETE FROM tools WHERE id = ?').run(id);
}

export function getToolById(id: number) {
  const r = getDb().prepare(`${SELECT} WHERE t.id = ?`).get(id) as Row | undefined;
  return r && toTool(r);
}

export function getPublishedBySlug(slug: string) {
  const r = getDb().prepare(`${SELECT} WHERE t.slug = ? AND t.status = 'published'`).get(slug) as Row | undefined;
  return r && toTool(r);
}

export type Query = { q?: string; tag?: string; kind?: Kind; limit?: number; offset?: number; order?: 'recent' | 'name' | 'random' };

export function listPublished(query: Query = {}) {
  const where = [`t.status = 'published'`];
  const params: (string | number)[] = [];
  if (query.kind) { where.push('t.kind = ?'); params.push(query.kind); }
  if (query.tag) { where.push('EXISTS (SELECT 1 FROM tool_tags x WHERE x.tool_id = t.id AND x.tag = ?)'); params.push(normalizeTag(query.tag)); }
  if (query.q?.trim()) {
    const like = `%${query.q.trim().toLowerCase().replace(/[\\%_]/g, (c) => '\\' + c)}%`;
    where.push(`(lower(t.name) LIKE ? ESCAPE '\\' OR lower(t.tagline) LIKE ? ESCAPE '\\' OR lower(t.description) LIKE ? ESCAPE '\\'
      OR lower(t.replaces) LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM tool_tags x WHERE x.tool_id = t.id AND x.tag LIKE ? ESCAPE '\\'))`);
    params.push(like, like, like, like, like);
  }
  const order = query.order === 'name' ? 'lower(t.name)' : query.order === 'random' ? 'random()' : 't.published_at DESC, t.id DESC';
  const filter = `WHERE ${where.join(' AND ')}`;
  const { n } = getDb().prepare(`SELECT COUNT(*) AS n FROM tools t ${filter}`).get(...params) as { n: number };
  const rows = getDb()
    .prepare(`${SELECT} ${filter} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(...params, query.limit ?? 24, query.offset ?? 0) as Row[];
  return { total: n, tools: rows.map(toTool) };
}

export function listByStatus(status: Status) {
  return (getDb().prepare(`${SELECT} WHERE t.status = ? ORDER BY t.updated_at DESC`).all(status) as Row[]).map(toTool);
}

export function related(tool: Tool, limit = 4) {
  if (!tool.tags.length) return [];
  const rows = getDb().prepare(
    `${SELECT} WHERE t.status = 'published' AND t.id != ?
       AND t.id IN (SELECT tool_id FROM tool_tags WHERE tag IN (${tool.tags.map(() => '?').join(',')}))
     ORDER BY (SELECT COUNT(*) FROM tool_tags WHERE tool_id = t.id AND tag IN (${tool.tags.map(() => '?').join(',')})) DESC, random()
     LIMIT ?`,
  ).all(tool.id, ...tool.tags, ...tool.tags, limit) as Row[];
  return rows.map(toTool);
}

export function tagCounts() {
  return getDb().prepare(
    `SELECT tag, COUNT(*) AS count FROM tool_tags JOIN tools ON tools.id = tool_id
     WHERE tools.status = 'published' GROUP BY tag ORDER BY count DESC, tag`,
  ).all() as { tag: string; count: number }[];
}

/** Every URL and slug already known (any status), so the scanner never re-suggests a rejected tool. */
export function knownIdentifiers() {
  const rows = getDb().prepare('SELECT slug, website, repo, found_via FROM tools').all() as {
    slug: string; website: string | null; repo: string | null; found_via: string | null;
  }[];
  const urls = new Set<string>();
  const slugs = new Set<string>();
  for (const r of rows) {
    slugs.add(r.slug);
    for (const u of [r.website, r.repo, r.found_via]) if (u) urls.add(normalizeUrl(u));
  }
  return { urls, slugs };
}

export function startScan() {
  return Number(getDb().prepare('INSERT INTO scan_runs (started_at) VALUES (?)').run(now()).lastInsertRowid);
}

export function finishScan(id: number, candidates: number, suggested: number, error: string | null = null) {
  getDb().prepare('UPDATE scan_runs SET finished_at = ?, candidates = ?, suggested = ?, error = ? WHERE id = ?')
    .run(now(), candidates, suggested, error, id);
}

export function recentScans(limit = 10) {
  return getDb().prepare('SELECT * FROM scan_runs ORDER BY id DESC LIMIT ?').all(limit) as {
    id: number; started_at: string; finished_at: string | null; candidates: number; suggested: number; error: string | null;
  }[];
}
