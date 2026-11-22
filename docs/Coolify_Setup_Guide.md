# Signal Lab: Coolify setup guide

Prepared 21 November 2026.

Signal Lab includes a separate self-hosting runtime: the same React interface, a Node.js 24 HTTP server, and a SQLite database. You can run it in Coolify without the current hosting platform or a Cloudflare account. AI discovery can run as a Coolify scheduled command with an OpenAI-compatible model endpoint, including an Ollama endpoint you already host.

## What is included

| File | Purpose |
| --- | --- |
| `Dockerfile` | Builds the interface and starts the Node.js server on port 3000 |
| `docker-compose.yml` | Optional Compose deployment with a persistent data volume |
| `selfhost/server.ts` | Private application server and SQLite-backed APIs |
| `selfhost/scan.mjs` | Collects original engineering articles, asks a model to assess workflows, and saves validated findings |
| `selfhost/import.ts` | Imports your exported research, experiments, preferences and history |
| `docs/DISCOVERY.md` | Discovery criteria and updater behavior |

The Docker runtime does not need the Sites build or Wrangler. The repository retains those files so the currently published version can continue to work.

## 1. Put the source in your repository

Unzip the supplied source bundle and push its contents to a private GitHub, GitLab or other repository you use with Coolify. The bundle contains no credentials, user database, or local dependency folders. Keep the root `Dockerfile`, `package.json`, `package-lock.json`, `selfhost`, `app`, and `public` directories together.

In Coolify, open your project and environment, choose **New**, connect this repository, and select **Dockerfile** as the build pack. Use the branch you normally deploy from.

Use these settings:

| Setting | Value |
| --- | --- |
| Base directory | `/` |
| Dockerfile location | `/Dockerfile` |
| Exposed/internal port | `3000` |
| Domain | Your chosen HTTPS domain |
| Health endpoint | `/health` |
| Start command | Leave empty; the Dockerfile supplies it |

The server listens on `0.0.0.0`. Your reverse proxy should terminate HTTPS. The image health check calls `/health`, which checks that the process can query its database. See the official [Coolify Dockerfile guide](https://coolify.io/docs/applications/builds/dockerfile).

## 2. Configure runtime variables

Add these in Coolify's **Environment Variables** section as runtime values, rather than build arguments. Use your own values for the placeholders.

```dotenv
AUTH_USER=shaun
AUTH_PASSWORD=<a-unique-password-at-least-16-characters-long>
DATABASE_PATH=/app/data/signal-lab.sqlite
PORT=3000
```

The self-hosted version uses browser HTTP Basic authentication. Opening the site prompts for this username and password; it does not use ChatGPT sign-in. Use HTTPS for that login. The server refuses to start without the required credentials.

For discovery, also add:

```dotenv
SCOUT_LLM_BASE_URL=<compatible-provider-base-url-ending-in-v1>
SCOUT_LLM_MODEL=<model-name-supported-by-that-provider>
SCOUT_LLM_KEY=<provider-api-key-if-required>
SCOUT_SITE_URL=http://127.0.0.1:3000
```

The model endpoint must support `POST /chat/completions`, JSON object responses, and the `max_tokens` parameter. This is a compatibility contract, not a guarantee that every model API works. Provider API usage can be billed separately from a ChatGPT subscription. The application sends public source extracts and the saved discovery brief to the configured model, not your source repository or experiment results.

For an Ollama service on a shared Docker network, the base URL can be `http://ollama:11434/v1`, with the actual service hostname substituted if different. Choose a locally installed model that can reliably return the required structured JSON. Leave `SCOUT_LLM_KEY` empty when that endpoint does not require one. `localhost` inside Signal Lab refers to its own container, not another container or your laptop.

Optional: set `SCOUT_INGEST_TOKEN` to a separate random value of at least 32 characters if you later connect an external researcher. That bearer token permits the discovery API only. The built-in scheduled command can authenticate using the application credentials, so this extra token is not required for a normal Coolify setup.

## 3. Make the data persistent

Before your first deployment, add a **Volume Mount** under **Persistent Storage** with destination:

```text
/app/data
```

This directory holds the SQLite database, WAL files and the scanner lock. Keep the destination exact. Do not mount over `/app`, which contains the application itself. The image runs as the `node` user, UID 1000; an existing bind-mounted directory must be writable by that user.

For the supplied Compose file, the named volume `signal-lab-data` already mounts at `/app/data`. Compose is the source of truth for that mount, so change it in the Compose file rather than creating a second mount in the UI.

Deploy, sign in, save a bookmark or preference, and redeploy once. Confirm the change survives. Persistent storage preserves container state across replacement; it does not replace backups. See [Coolify persistent storage](https://coolify.io/docs/applications/configuration/persistent-storage).

## 4. Move your current workspace

In the current Signal Lab, click the download icon in the top bar to export the workspace JSON. This includes research, saved decisions, experiments, discovery preferences and scan history.

Deploy the self-hosted version with its persistent volume. Copy your export into that volume as `/app/data/workspace-export.json` using your normal server file-transfer method. In Coolify's application terminal, run:

```sh
node selfhost/import.ts /app/data/workspace-export.json
```

The importer refuses to overwrite existing saved data by default. If you have intentionally chosen to replace an existing self-hosted workspace, back it up first, then run:

```sh
node selfhost/import.ts /app/data/workspace-export.json --replace-existing
```

Reload the site and confirm that research counts, bookmarks and experiment notes match. The import resets the old cloud schedule indicator, because moving the database does not move the automation itself. Your self-hosted and currently published databases remain separate.

## 5. Turn on autonomous discovery

First configure the model variables from step 2, then run this in the application terminal:

```sh
node selfhost/scan.mjs
```

The collector reads a bounded selection of original articles from GitHub, Anthropic, and Microsoft engineering pages and feeds. It examines up to twelve candidate pages, asks the configured model to identify useful processes, and accepts only sources it actually fetched. This self-hosted collector covers those configured sources; the ChatGPT-hosted researcher can search the wider web. To expand self-hosted coverage, edit the catalog and host allowlist in `selfhost/scan.mjs` and redeploy.

The scanner reads your current **AI Scout → discovery brief**, including task focus, lookback window, and maximum findings. It allows zero finds, ignores duplicates, never overwrites existing decisions or results, and requires an experiment hypothesis and measurement plan. Newly saved findings still need your review. It does not execute coding experiments or modify your other repositories.

Open **AI Scout** after the command finishes. Confirm the new scan history entry and any findings; a successful process exit alone is not sufficient. An unavailable source set or rejected AI response must fail without inventing discoveries.

Next open **Scheduled Tasks → Add** in Coolify:

| Setting | Value |
| --- | --- |
| Name | Discover practical AI workflows |
| Command | `node selfhost/scan.mjs` |
| Cron | `0 8 * * 1-5` |
| Container | The Signal Lab application container |
| Timeout | `600` seconds |
| Enabled | Yes |

Coolify uses the deployment server's configured timezone for scheduled tasks. Set that server timezone to **Europe/London** if you want 08:00 UK time through daylight saving changes. Changing only the container's `TZ` value does not set Coolify's scheduler timezone. Use **Execute now**, then inspect **Recent executions** and the site history. See [Coolify scheduled tasks](https://coolify.io/docs/applications/operations/scheduled-tasks).

When the self-hosted schedule is working, pause the old ChatGPT-linked discovery schedule if you no longer want the currently published instance updated. Changing servers does not automatically pause that task.

## 6. Backups and updates

For normal use, keep a recent workspace JSON export in another location. For a full server backup, stop the application before copying the entire `/app/data` directory, or use SQLite's online backup tooling. Copying only the main database file while writes are active can miss WAL data. Test a restore into a separate deployment.

Use one application replica with one local SQLite volume. This runtime is intended for a personal workspace, not several independently writable replicas. When deploying new source, keep the existing volume mounted.

Coolify can redeploy the app from your Git branch. A source redeployment does not require reimporting your workspace. Provider credentials belong in runtime variables; keep them out of Git and source bundles.

## Quick troubleshooting

| Symptom | Check |
| --- | --- |
| Container exits immediately | Required username/password and their lengths; application logs |
| Proxy shows a gateway error | Port 3000, health check, and the server listening on all interfaces |
| Database permission error | `/app/data` mount ownership and write access for UID 1000 |
| Notes vanish after redeploy | Correct persistent mount destination; avoid a second empty volume |
| Scanner says configuration is missing | Runtime model base URL and model name; redeploy after adding values |
| AI provider rejects a request | Compatible chat completions API, JSON mode, model access, key and available quota |
| Scan finishes with zero additions | Open the history: duplicate or weak candidates are expected to be discarded |
| Discovery is paused | Enable new discoveries in the saved AI Scout preferences |
| A failed scan leaves a lock | Wait for the active process to finish; abandoned locks expire after two hours |

## Verification for this handoff

The frontend build and the Node.js/SQLite runtime were checked locally, including authentication, persistence after restart, conflict handling, discovery deduplication and replay protection. The hosted discovery writer is verified separately with a real research report. No Docker daemon was available to build the image here, and no self-hosted AI provider credentials were supplied, so those two deployment-specific checks must be completed on your server.
