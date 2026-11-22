import type { APIRoute } from 'astro';
import { getPublishedBySlug, getVote, setVote, votersOnNetwork, voteTally, type VoteValue } from '../../../lib/db.ts';
import { isHttps } from '../../../lib/auth.ts';
import { clientIp, ensureVoterId, networkHash, rateLimited, VOTERS_PER_NETWORK } from '../../../lib/votes.ts';

// Works with and without JavaScript: the Recommend component posts here with
// fetch (Accept: application/json); a plain form post is redirected back.
export const POST: APIRoute = async (context) => {
  const { params, request, cookies, redirect } = context;
  const tool = getPublishedBySlug(params.slug ?? '');
  if (!tool) return new Response('Not found', { status: 404 });
  const json = (request.headers.get('accept') ?? '').includes('application/json');
  const fail = (status: number, error: string) =>
    json ? Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } }) : new Response(error, { status });

  const form = await request.formData().catch(() => null);
  const choice = String(form?.get('vote') ?? '');
  const value: VoteValue | 0 | undefined = choice === 'up' ? 1 : choice === 'down' ? -1 : choice === 'clear' ? 0 : undefined;
  if (value === undefined) return fail(400, 'Unknown vote.');

  const network = networkHash(clientIp(request, () => context.clientAddress));
  if (rateLimited(network)) return fail(429, 'That’s a lot of votes in a short time. Try again in a few minutes.');

  const voter = ensureVoterId(cookies, isHttps(request));
  if (value !== 0 && getVote(tool.id, voter) === 0 && votersOnNetwork(tool.id, network, voter) >= VOTERS_PER_NETWORK) {
    return fail(429, 'Several people on your network have already rated this tool, so we can’t take more votes from it.');
  }
  setVote(tool.id, voter, value, network);

  if (!json) return redirect(`/tools/${tool.slug}#recommend`, 303);
  return Response.json({ ...voteTally(tool.id), mine: value }, { headers: { 'Cache-Control': 'no-store' } });
};
