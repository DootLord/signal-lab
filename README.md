# Signal Lab

A site for finding developer tools: what's **new** and moving, and the **gems** you may have missed, the established tools you'd normally only hear about from a well-informed teammate.

- **Public site:** home page, browse and search with tag filters, a page for each tool, and an RSS feed (`/feed.xml`).
- **Admin** (`/admin`, password protected): add and edit tools, and review what the scanner suggests.
- **Scanner:** a scheduled job that collects candidates from GitHub and Hacker News, asks a self-hosted AI model to pick the best ones and draft cards, and saves them as *pending*. **Nothing is published until you approve it.**

Built with [Astro](https://astro.build) (server-rendered) and SQLite (`node:sqlite`, built into Node 24). The scanner uses a small open model through Ollama, or any OpenAI-compatible API.

## Each tool card

| Field | What it says |
|---|---|
| Tagline | What the tool is, in one sentence |
| Description | What it does and why it's good |
| Instead of | What people typically use today |
| Reach for it when | The situation where it pays off |
| Try it | A few commands to get going in minutes |
| Type | **Gem** (established but often missed) or **New** (recent or gaining momentum) |
| Tags, links | Ecosystem and category; website, repo, docs |

The first time it starts, the database is filled with 26 hand-written gems (Bun, Molecule, Biome, mise, just, Testcontainers, uv and more). See [src/lib/seed.ts](src/lib/seed.ts).

## Local development

Requires Node 24+.

```bash
npm install
ADMIN_PASSWORD=change-me-please npm run dev     # http://localhost:4321
npm run check                                   # type check
npm run build && npm start                      # production build
```

Data is stored in `./data/signal-lab.sqlite` (set `DATABASE_PATH` to change it). To start fresh, delete that file.

## Deploying on Coolify

The stack has two containers: the site, and [Ollama](https://ollama.com) running a small open model for the scanner. Ollama is only reachable inside the stack.

1. **New resource → Git repository**, build pack **Docker Compose** (it uses `docker-compose.yml`).
2. Give the **signal-lab** service your domain, on port **3000**. Coolify's proxy handles HTTPS. **Don't** give the `ollama` service a domain: Ollama has no authentication.
3. **Environment variables:**

   | Variable | Required | Purpose |
   |---|---|---|
   | `ADMIN_PASSWORD` | yes | Admin sign-in (8+ characters). Admin is disabled if unset. |
   | `GITHUB_TOKEN` | no | Any read-only token; raises GitHub's API rate limits for the scanner |
   | `SESSION_SECRET` | no | Signs admin sessions. If unset, derived from `ADMIN_PASSWORD`, so changing the password signs everyone out. |
   | `SCAN_LLM_MODEL` | no | Ollama model for the scanner (default `gemma3:4b`, see below) |
   | `SCAN_MAX_SUGGESTIONS` | no | Maximum suggestions per run (default 6, max 15) |

   The volumes for the database (`/app/data`) and the downloaded models are declared in the compose file, so they survive deploys.
4. Deploy. `/health` is the site's health check.
5. **Scheduled task** (Coolify → your app → Scheduled Tasks), on the `signal-lab` container:
   - Command: `node scripts/scan.ts`
   - Frequency: `0 4 * * *` (daily at 04:00, a quiet time for the server) or `0 4 * * 1` (weekly)

   The first run downloads the model, about 3 GB for the default. Each run's result appears under **Scanner runs** in `/admin`, and its suggestions appear in the review queue.

### Choosing a model for your server

The scanner runs on the CPU. No GPU is needed. Pick a model by how much RAM you can spare during a scan:

| Free RAM | `SCAN_LLM_MODEL` | Notes |
|---|---|---|
| ~3 GB | `qwen2.5:3b` | Lightest option that still writes decent cards |
| ~5 GB | `gemma3:4b` (default) | Good balance of quality and speed |
| ~10 GB | `qwen2.5:7b` or `gemma3:12b` | Noticeably better judgement, slower |

The model is loaded only while a scan runs and unloaded 5 minutes afterwards, so the RAM is borrowed, not reserved. On a typical 4–8 core server, expect a run to take roughly 10–30 minutes. That's fine for a nightly job. To cap the model's memory, uncomment `mem_limit` in `docker-compose.yml`.

### Using a hosted model instead

The scanner works with any OpenAI-compatible API. If the local model's picks aren't good enough, or the server needs the RAM back, set these three variables and the local model is no longer used:

```
SCAN_LLM_URL=https://api.openai.com/v1     # or https://openrouter.ai/api/v1, etc.
SCAN_LLM_MODEL=<the provider's model name>
SCAN_LLM_KEY=<API key>
```

With a key set, the scanner sends all candidates in a single request. A small, cheap model from these providers costs very little per run at this volume. You can then remove the `ollama` service from the compose file.

## The scanner

`node scripts/scan.ts` takes these steps:

1. **Collects** about 24 candidates, split evenly across three sources:
   - new GitHub repos gaining stars over the last 30 days
   - mature (2+ years), actively maintained GitHub repos, from two topics that rotate daily (cli, testing, ansible, kubernetes, python and more). This is the source for gems.
   - popular Show HN posts from the last 10 days
2. **Skips** anything already in the database, including tools you've rejected, so they never come back.
3. **Asks the model** to score each candidate and draft a card for any that score 6/10 or higher. It sends 3 candidates at a time for a local model, or all at once for a hosted one. The model sees a README excerpt for each repo. Links on the cards always come from GitHub or Hacker News data, never from the model.
4. **Saves** the top `SCAN_MAX_SUGGESTIONS` picks as pending, each with its score and a note explaining why it was suggested.

A small local model will sometimes misjudge a tool or write a clumsy card. That's what the review queue is for: edit it, reject it, or publish it. If a batch comes back malformed, the scanner skips it and carries on.

Run `node scripts/scan.ts --dry-run` to see the candidates without calling the model or saving anything.

## Project layout

```
src/lib/db.ts         SQLite schema, migrations and queries
src/lib/seed.ts       Starter catalogue
src/lib/auth.ts       Admin password and signed session cookie
src/middleware.ts     Admin guard, same-origin check on form posts, security headers
src/pages/            Public pages, admin pages, /feed.xml, /health
scripts/scan.ts       Scanner (runs directly with Node's TypeScript support)
```
