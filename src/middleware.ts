import { defineMiddleware } from 'astro:middleware';
import { isAdmin } from './lib/auth.ts';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, cookies, redirect } = context;

  // Same-origin check for every state-changing request. Compares against the
  // Host the browser used (X-Forwarded-Host behind Coolify's proxy).
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host')?.split(',')[0].trim() || request.headers.get('host');
    let originHost: string | null = null;
    try { originHost = origin ? new URL(origin).host : null; } catch { /* invalid origin header */ }
    if (!originHost || originHost !== host) return new Response('Cross-site request blocked.', { status: 403 });
  }

  const adminArea = url.pathname === '/admin' || url.pathname.startsWith('/admin/');
  const open = url.pathname === '/admin/login';
  context.locals.admin = isAdmin(cookies);
  if (adminArea && !open && !context.locals.admin) return redirect('/admin/login?next=' + encodeURIComponent(url.pathname));

  const response = await next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  if (adminArea) response.headers.set('Cache-Control', 'no-store');
  return response;
});
