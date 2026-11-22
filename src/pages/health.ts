import type { APIRoute } from 'astro';
import { getDb } from '../lib/db.ts';

export const GET: APIRoute = () => {
  getDb().prepare('SELECT 1').get();
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
};
