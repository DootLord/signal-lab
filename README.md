# Signal Lab

A site for finding developer tools: what's **new** and moving, and the **gems** you may have missed, the established tools you'd normally only hear about from a well-informed teammate.

- **Public site:** home page, browse and search with tag filters, a page for each tool, and an RSS feed (`/feed.xml`).
- **Admin** (`/admin`, password protected): add and edit tools, and review what the scanner suggests.
- **Scanner:** a scheduled job that collects candidates from GitHub and Hacker News, asks an AI model to pick the best ones and draft cards, and saves them as *pending*. **Nothing is published until you approve it.**

Built with [Astro](https://astro.build) 5 (server-rendered) and SQLite (`node:sqlite`, built into Node 24). The scanner uses any OpenAI-compatible model API (OpenAI by default).

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

## Logos

Each tool shows its own logo, found automatically and stored in the database, so pages never hotlink other sites. The lookup tries the icons the tool's website declares (SVG favicon, web-app manifest, apple-touch-icon, `/favicon.ico`), then the avatar of the GitHub **organisation** that owns the repo. Personal GitHub avatars are skipped, since they're faces rather than logos. Anything smaller than 32px is rejected and the tool keeps its coloured monogram.

Logos are looked up when a tool is added or its links change, on each server start for any tool still missing one, and after every scanner run. Failed lookups are retried after a week and found logos are refreshed monthly. In the admin editor, **Refetch logo** looks again straight away, and **Logo image URL** overrides auto-detection for a tool whose site has no usable icon.

## Recommendations

Every tool page asks **“Would you recommend it?”**: *Recommend* or *Not for me*. The page shows the share who recommend it, cards show the number of recommendations, and Browse can sort by **Most recommended**. There are no visitor accounts. A visitor is identified by a random cookie, each network (a salted hash of the IP; raw IPs are never stored) can cast at most 5 votes per tool, and vote requests are rate limited.

## Tool write-ups

Each tool page has a long-form section: key features, an in-depth write-up, strengths, things to watch out for, alternatives, license and implementation language. All of it is editable in the admin editor.

The starting content lives in [content/tools/](content/tools/), one Markdown file per tool, named after its URL slug (for example `content/tools/bun.md`). These files are used to:

- seed a brand-new database
- fill in tools that existed before write-ups did (a one-time step on first start after upgrading, which never overwrites anything edited in the admin)
- fill in imported cards that arrive without their own write-up

After that, the database is the source of truth; editing a file doesn't change a tool that already has content. The file format is documented at the top of [src/lib/content.ts](src/lib/content.ts). Write-ups support a small, safe subset of Markdown: `###` headings, lists, code fences, `inline code`, **bold** and https links. HTML is always escaped.

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

Coolify builds the image on the server from the [Dockerfile](Dockerfile). The server's CPU (a Xeon E5-1620 v2) has no AVX2, and many modern build tools ship native binaries that crash without it (exit code 132). So the project uses Astro 5, whose build runs on esbuild and a WebAssembly compiler, and swaps Rollup's native binary for its WebAssembly build (`overrides` in [package.json](package.json)). Check this before upgrading Astro: Astro 7 (Vite 8) adds Rust-native build tools that crashed on this server.

1. **New resource → Git repository**, build pack **Docker Compose** (it uses `docker-compose.yml`). Auto-deploy on push can stay on.
2. Give the **signal-lab** service your domain, on port **3000**. Coolify's proxy handles HTTPS.
3. **Environment variables:**

   | Variable | Required | Purpose |
   |---|---|---|
   | `ADMIN_PASSWORD` | yes | Admin sign-in (8+ characters). Admin is disabled if unset. |
   | `SCAN_LLM_KEY` | for the scanner | API key for the scanner's model (OpenAI by default) |
   | `SCAN_LLM_MODEL` | no | Model name (default `gpt-5-mini`) |
   | `SCAN_LLM_URL` | no | OpenAI-compatible API base URL (default `https://api.openai.com/v1`) |
   | `GITHUB_TOKEN` | no | Any read-only token; raises GitHub's API rate limits for the scanner |
   | `SESSION_SECRET` | no | Signs admin sessions. If unset, derived from `ADMIN_PASSWORD`, so changing the password signs everyone out. |
   | `SCAN_MAX_SUGGESTIONS` | no | Maximum suggestions per run (default 6, max 15) |

   The database volume (`/app/data`) is declared in the compose file, so it survives deploys.
4. Deploy. `/health` is the site's health check.
5. **Scheduled task** (Coolify → your app → Scheduled Tasks), on the `signal-lab` container:
   - Command: `node scripts/scan.ts`
   - Frequency: `0 7 * * *` (daily) or `0 7 * * 1` (weekly)

   Each run's result appears under **Scanner runs** in `/admin`, and its suggestions appear in the review queue.

### Choosing the scanner's model

The scanner works with any OpenAI-compatible API:

| Provider | `SCAN_LLM_URL` | Notes |
|---|---|---|
| OpenAI (default) | leave unset | Use a small, cheap model. Each run is a single request of roughly 25–35k input tokens. |
| OpenRouter | `https://openrouter.ai/api/v1` | One key for many providers' models |
| Ollama on a machine with AVX2 | `http://<host>:11434/v1` | Free, but needs ~5 GB RAM. Leave `SCAN_LLM_KEY` unset: the scanner then sends 3 candidates at a time and downloads the model on first use. |

Check your provider's pricing page for current rates. At this volume, a small model should cost very little per run.

## The scanner

`node scripts/scan.ts` takes these steps:

1. **Collects** about 24 candidates, split evenly across three sources:
   - new GitHub repos gaining stars over the last 30 days
   - mature (2+ years), actively maintained GitHub repos, from two topics that rotate daily (cli, testing, ansible, kubernetes, python and more). This is the source for gems.
   - popular Show HN posts from the last 10 days
2. **Skips** anything already in the database, including tools you've rejected, so they never come back.
3. **Asks the model** to score each candidate and draft a card for any that score 6/10 or higher. The model sees a README excerpt for each repo. Links on the cards always come from GitHub or Hacker News data, never from the model.
4. **Saves** the top `SCAN_MAX_SUGGESTIONS` picks as pending, each with its score and a note explaining why it was suggested.

The model will sometimes misjudge a tool or write a clumsy card. That's what the review queue is for: edit it, reject it, or publish it. If the model's reply is malformed, the scanner skips it rather than saving anything broken.

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
