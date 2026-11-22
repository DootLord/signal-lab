// "Would you recommend it?" votes. There are no visitor accounts, so a visitor is
// a random ID in a long-lived cookie. To keep cookie-clearing from stuffing the
// count, each network (hashed IP, never stored raw) can cast at most a few votes
// per tool, and vote requests per network are rate limited.
import { createHmac, randomBytes } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { voteSalt } from './db.ts';

const COOKIE = 'sl_voter';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 730;
/** Distinct voters per tool from one network (enough for a team sharing an office IP). */
export const VOTERS_PER_NETWORK = 5;
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 40;

export function voterId(cookies: AstroCookies) {
  const v = cookies.get(COOKIE)?.value;
  return v && /^[A-Za-z0-9_-]{22}$/.test(v) ? v : undefined;
}

export function ensureVoterId(cookies: AstroCookies, secure: boolean) {
  const existing = voterId(cookies);
  if (existing) return existing;
  const id = randomBytes(16).toString('base64url');
  cookies.set(COOKIE, id, { path: '/', httpOnly: true, sameSite: 'lax', secure, maxAge: COOKIE_MAX_AGE });
  return id;
}

/**
 * The visitor's IP. Behind Coolify the app is only reachable through its proxy
 * (Traefik), which sets X-Real-Ip and appends the real client to X-Forwarded-For.
 */
export function clientIp(request: Request, clientAddress: () => string) {
  const real = request.headers.get('x-real-ip')?.trim();
  if (real) return real;
  const forwarded = request.headers.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean);
  if (forwarded?.length) return forwarded[forwarded.length - 1];
  try { return clientAddress(); } catch { return 'unknown'; }
}

/** IPv6 visitors usually own a whole /64, so treat that as one network. */
function networkOf(ip: string) {
  const plain = ip.replace(/^::ffff:/i, '');
  if (!plain.includes(':')) return plain;
  const [left, right = ''] = plain.toLowerCase().split('::');
  const l = left ? left.split(':') : [];
  const r = right ? right.split(':') : [];
  const groups = [...l, ...Array(Math.max(0, 8 - l.length - r.length)).fill('0'), ...r];
  return groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, '')).join(':') + '::/64';
}

export function networkHash(ip: string) {
  return createHmac('sha256', voteSalt()).update(networkOf(ip)).digest('base64url').slice(0, 22);
}

const hits = new Map<string, number[]>();

/** True when this network has sent too many vote requests recently. */
export function rateLimited(network: string) {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  const recent = (hits.get(network) ?? []).filter((t) => t > cutoff);
  recent.push(Date.now());
  hits.set(network, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => t > cutoff)) hits.delete(k);
  return recent.length > RATE_MAX;
}

export function summary(up: number, down: number) {
  const total = up + down;
  return { total, percent: total ? Math.round((up / total) * 100) : 0 };
}
