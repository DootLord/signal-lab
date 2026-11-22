import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

export const COOKIE = 'sl_admin';
const MAX_AGE = 60 * 60 * 24 * 14;

const password = () => process.env.ADMIN_PASSWORD || '';
export const adminEnabled = () => password().length >= 8;

// Sessions are signed with SESSION_SECRET, or a key derived from the admin
// password so that changing the password signs everyone out.
const key = () => process.env.SESSION_SECRET || createHash('sha256').update('signal-lab-session:' + password()).digest('hex');
const sign = (value: string) => createHmac('sha256', key()).update(value).digest('base64url');

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(attempt: string) {
  if (!adminEnabled()) return false;
  // Hash both sides so the comparison is constant-time regardless of length.
  const h = (s: string) => createHash('sha256').update(s).digest('hex');
  return same(h(attempt), h(password()));
}

export function isAdmin(cookies: AstroCookies) {
  if (!adminEnabled()) return false;
  const token = cookies.get(COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split('.');
  return !!exp && !!sig && Number(exp) > Date.now() / 1000 && same(sig, sign(exp));
}

export function startSession(cookies: AstroCookies, secure: boolean) {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  cookies.set(COOKIE, `${exp}.${sign(exp)}`, { path: '/', httpOnly: true, sameSite: 'lax', secure, maxAge: MAX_AGE });
}

export function endSession(cookies: AstroCookies) {
  cookies.delete(COOKIE, { path: '/' });
}

/** True when the original request was HTTPS, including behind Coolify's proxy. */
export function isHttps(request: Request) {
  return request.headers.get('x-forwarded-proto')?.split(',')[0].trim() === 'https' || new URL(request.url).protocol === 'https:';
}
