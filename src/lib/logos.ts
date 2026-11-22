// Finds each tool's logo on its own website and stores a copy in the database, so
// pages never hotlink third-party sites. No npm imports: scripts/scan.ts uses this
// with plain Node.
//
// Order of preference:
//   1. The admin's "Logo image URL" override, if set (and nothing else).
//   2. Icons the website declares: SVG favicon, web-app manifest icons,
//      apple-touch-icon, sized <link rel="icon">, then /favicon.ico.
//   3. The GitHub avatar of the repo's owner, but only for organisations
//      (a personal avatar is a face, not a logo).
// Anything under 32px is rejected, so the monogram is shown instead.
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { getToolById, saveLogo, toolsNeedingLogos, type FetchedLogo, type Tool } from './db.ts';

const UA = 'Mozilla/5.0 (compatible; SignalLab/1.0; logo fetcher)';
const MAX_IMAGE_BYTES = 400_000;
const MAX_HTML_BYTES = 600_000;
const MIN_SIZE = 32;
const PER_TOOL_MS = 20_000;
// Sites whose favicon is their own brand, not the project's.
const CODE_HOSTS = /(^|\.)(github\.com|gitlab\.com|codeberg\.org|bitbucket\.org|sr\.ht|npmjs\.com|pypi\.org|crates\.io|pkg\.go\.dev|sourceforge\.net)$/i;

// ───────────────── Fetching safely ─────────────────

function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19));
  }
  const x = ip.toLowerCase();
  const mapped = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateAddress(mapped[1]);
  return x === '::' || x === '::1' || x.startsWith('::ffff:') || /^(fc|fd|fe[89ab]|ff)/.test(x) || x.startsWith('64:ff9b:') || x.startsWith('2002:');
}

type Fetched = { url: URL; bytes: Uint8Array; type: string };

/**
 * fetch() for URLs that come from tool data: public http(s) hosts on standard ports
 * only, every redirect re-checked, and the body capped at maxBytes (HTML is
 * truncated, since the <head> is all we need; anything else over the cap is rejected).
 */
async function safeFetch(raw: string | URL, accept: string, maxBytes: number, signal: AbortSignal, truncate = false): Promise<Fetched> {
  let url = new URL(raw);
  for (let hop = 0; hop < 5; hop++) {
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error(`unsupported link ${url.protocol}`);
    if (url.port && url.port !== '80' && url.port !== '443') throw new Error('non-standard port');
    if (url.username || url.password) throw new Error('credentials in URL');
    const host = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address);
    if (!addresses.length || addresses.some(isPrivateAddress)) throw new Error(`${host} is not a public address`);

    const res = await fetch(url, {
      redirect: 'manual', signal: AbortSignal.any([signal, AbortSignal.timeout(8_000)]),
      headers: { 'User-Agent': UA, Accept: accept },
    });
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      await res.body?.cancel();
      url = new URL(location, url);
      continue;
    }
    if (!res.ok || !res.body) {
      await res.body?.cancel();
      throw new Error(`${host} responded ${res.status}`);
    }
    if (!truncate && Number(res.headers.get('content-length')) > maxBytes) {
      await res.body.cancel();
      throw new Error('image too large');
    }
    const chunks: Uint8Array[] = [];
    let total = 0;
    const reader = res.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        if (!truncate) throw new Error('image too large');
        break;
      }
    }
    const bytes = new Uint8Array(Math.min(total, maxBytes));
    let offset = 0;
    for (const c of chunks) {
      const part = c.subarray(0, bytes.length - offset);
      bytes.set(part, offset);
      offset += part.length;
      if (offset >= bytes.length) break;
    }
    return { url, bytes, type: (res.headers.get('content-type') ?? '').toLowerCase() };
  }
  throw new Error('too many redirects');
}

// ───────────────── Recognising images ─────────────────

/** Identifies an image from its bytes (never trusting Content-Type) and reads its size where that's cheap. */
export function sniffImage(b: Uint8Array): { mime: string; size: number | null } | null {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const ascii = (start: number, end: number) => String.fromCharCode(...b.subarray(start, end));
  if (b.length > 24 && view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a) {
    return { mime: 'image/png', size: Math.max(view.getUint32(16), view.getUint32(20)) };
  }
  if (b.length > 10 && (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a')) {
    return { mime: 'image/gif', size: Math.max(view.getUint16(6, true), view.getUint16(8, true)) };
  }
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: 'image/jpeg', size: null };
  if (b.length > 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { mime: 'image/webp', size: null };
  if (b.length > 6 && view.getUint32(0) === 0x00000100) {
    const count = view.getUint16(4, true);
    let size = 0;
    for (let i = 0; i < count && 6 + i * 16 + 1 < b.length; i++) {
      const w = b[6 + i * 16] || 256, h = b[7 + i * 16] || 256;
      size = Math.max(size, w, h);
    }
    return count ? { mime: 'image/x-icon', size } : null;
  }
  const head = new TextDecoder().decode(b.subarray(0, 4096)).replace(/^﻿/, '');
  if (/^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*|<!DOCTYPE[^>]*>\s*)*<svg[\s>]/i.test(head)) return { mime: 'image/svg+xml', size: null };
  return null;
}

async function fetchImage(url: string | URL, signal: AbortSignal): Promise<FetchedLogo> {
  const res = await safeFetch(url, 'image/svg+xml,image/png,image/webp,image/*;q=0.8,*/*;q=0.5', MAX_IMAGE_BYTES, signal);
  const kind = sniffImage(res.bytes);
  if (!kind) throw new Error(`${res.url.pathname} is not an image`);
  if (kind.size !== null && kind.size < MIN_SIZE) throw new Error(`${res.url.pathname} is only ${kind.size}px`);
  return { mime: kind.mime, data: res.bytes, source: res.url.toString() };
}

// ───────────────── Finding icons on a website ─────────────────

function attributes(tag: string) {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    out[m[1].toLowerCase()] = (m[2] ?? m[3] ?? m[4] ?? '').replace(/&amp;/g, '&').trim();
  }
  return out;
}

const largest = (sizes: string | undefined) =>
  Math.max(0, ...(sizes ?? '').split(/\s+/).map((s) => Number(s.toLowerCase().split('x')[0]) || 0));

type IconCandidate = { url: URL; score: number };

/** Scores an icon: SVG first (it scales), then by declared pixel size. */
function score(url: URL, type: string | undefined, sizes: string | undefined, fallback: number) {
  if (type === 'image/svg+xml' || /\.svg$/i.test(url.pathname) || sizes?.toLowerCase() === 'any') return 1000;
  return Math.min(largest(sizes) || fallback, 512);
}

async function websiteIcons(website: string, signal: AbortSignal): Promise<IconCandidate[]> {
  const page = await safeFetch(website, 'text/html,application/xhtml+xml', MAX_HTML_BYTES, signal, true);
  const html = new TextDecoder().decode(page.bytes);
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd > 0 ? html.slice(0, headEnd) : html;
  const baseHref = head.match(/<base\b[^>]*href\s*=\s*["']([^"']+)["']/i)?.[1];
  const base = (() => { try { return new URL(baseHref ?? '', page.url); } catch { return page.url; } })();
  const resolve = (href: string) => { try { return new URL(href, base); } catch { return null; } };

  const icons: IconCandidate[] = [];
  let manifest: URL | null = null;
  for (const m of head.matchAll(/<link\b[^>]*>/gi)) {
    const a = attributes(m[0]);
    const rel = (a.rel ?? '').toLowerCase().split(/\s+/);
    const url = a.href ? resolve(a.href) : null;
    if (!url || url.protocol === 'data:') continue;
    if (rel.includes('manifest')) manifest = url;
    else if (rel.includes('apple-touch-icon') || rel.includes('apple-touch-icon-precomposed')) icons.push({ url, score: score(url, a.type, a.sizes, 180) });
    else if (rel.includes('icon')) icons.push({ url, score: score(url, a.type, a.sizes, /\.ico$/i.test(url.pathname) ? 32 : 48) });
  }

  if (manifest) {
    try {
      const res = await safeFetch(manifest, 'application/manifest+json,application/json', 100_000, signal);
      const data = JSON.parse(new TextDecoder().decode(res.bytes)) as { icons?: { src?: string; sizes?: string; type?: string; purpose?: string }[] };
      for (const icon of data.icons ?? []) {
        if (!icon.src || (icon.purpose && !icon.purpose.split(/\s+/).includes('any'))) continue;
        const url = (() => { try { return new URL(icon.src, res.url); } catch { return null; } })();
        if (url) icons.push({ url, score: score(url, icon.type, icon.sizes, 192) });
      }
    } catch { /* manifests are optional */ }
  }

  icons.push({ url: new URL('/favicon.ico', page.url), score: 1 });
  const seen = new Set<string>();
  return icons.sort((x, y) => y.score - x.score).filter((i) => !seen.has(i.url.href) && seen.add(i.url.href));
}

async function githubOrgAvatar(repo: string, signal: AbortSignal): Promise<FetchedLogo | null> {
  const owner = repo.match(/^https?:\/\/(?:www\.)?github\.com\/([^/]+)/i)?.[1];
  if (!owner) return null;
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(owner)}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(8_000)]),
    headers: {
      'User-Agent': 'signal-lab', Accept: 'application/vnd.github+json',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
  const user = await res.json() as { type?: string; avatar_url?: string };
  if (user.type !== 'Organization' || !user.avatar_url) return null;
  const avatar = new URL(user.avatar_url);
  avatar.searchParams.set('s', '256');
  return fetchImage(avatar, signal);
}

/** Looks up a logo for a tool. Throws with a short summary of what was tried when nothing usable is found. */
export async function findLogo(tool: Pick<Tool, 'website' | 'repo' | 'logoUrl'>): Promise<FetchedLogo> {
  const signal = AbortSignal.timeout(PER_TOOL_MS);
  const problems: string[] = [];
  const note = (e: unknown) => problems.push(e instanceof Error ? (e.name === 'TimeoutError' ? 'timed out' : e.message) : String(e));

  if (tool.logoUrl) return fetchImage(tool.logoUrl, signal);

  const sites = [tool.website, tool.repo].filter((u): u is string => {
    try { return !!u && !CODE_HOSTS.test(new URL(u).hostname); } catch { return false; }
  });
  for (const site of [...new Set(sites)]) {
    let icons: IconCandidate[] = [];
    try {
      icons = await websiteIcons(site, signal);
    } catch (e) {
      // Some sites refuse bots their HTML but still serve the favicon.
      note(e);
      icons = [{ url: new URL('/favicon.ico', site), score: 1 }];
    }
    for (const icon of icons.slice(0, 6)) {
      try { return await fetchImage(icon.url, signal); } catch (e) { note(e); }
    }
  }
  if (tool.repo) {
    try {
      const avatar = await githubOrgAvatar(tool.repo, signal);
      if (avatar) return avatar;
      problems.push('GitHub owner is a person, not an organisation');
    } catch (e) { note(e); }
  }
  if (!sites.length && !tool.repo) problems.push('no website or repo');
  throw new Error([...new Set(problems)].slice(0, 4).join('; ') || 'nothing found');
}

/** Looks up and stores the logo for one tool. Never throws. */
export async function refreshLogo(id: number) {
  const tool = getToolById(id);
  if (!tool) return;
  try {
    saveLogo(id, await findLogo(tool));
  } catch (e) {
    saveLogo(id, { error: e instanceof Error ? e.message : String(e) });
  }
}

let running: Promise<number> | null = null;

/**
 * Fetches logos for tools that don't have one yet (and retries old failures,
 * and refreshes old logos), a few at a time. Safe to call repeatedly: concurrent
 * calls share one run. Resolves to the number of tools checked.
 */
export function backfillLogos(concurrency = 4): Promise<number> {
  running ??= (async () => {
    const queue = toolsNeedingLogos();
    const total = queue.length;
    await Promise.all(Array.from({ length: Math.min(concurrency, total) }, async () => {
      for (let id = queue.shift(); id !== undefined; id = queue.shift()) await refreshLogo(id);
    }));
    return total;
  })().finally(() => { running = null; });
  return running;
}
