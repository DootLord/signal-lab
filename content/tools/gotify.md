---
license: MIT
language: Go
---

## Features
- Send with one request: POST a message to the REST API with an application token, from any script, cron job or CI pipeline.
- Real-time delivery: Clients receive messages instantly over WebSocket.
- Apps and clients: Separate tokens for sending applications and receiving clients, with per-app icons and priorities.
- Android app and web UI: Notifications on your phone (Google Play or F-Droid) and in the browser.
- CLI: `gotify push` sends messages from the command line with stored config.
- Extras: Markdown messages, click URLs, and a Go plugin system for custom behaviour.

## Strengths
- Self-hosted and private: your notifications don't pass through a third-party service.
- Tiny and simple to run: one Go binary or container, with SQLite by default.
- Sending is a single curl, so anything can notify you.
- A mature project (since 2018) that does one job well.

## Watch out for
- There's no official iOS app; iOS users usually prefer ntfy or Pushover.
- The Android app keeps a persistent connection to your server, so the server must be reachable from your phone.
- Protect the web UI and API with HTTPS and strong passwords if it's exposed to the internet.

## Alternatives
- ntfy: Topic-based push over plain HTTP, with Android and iOS apps; self-hostable or hosted.
- Pushover: A paid hosted service with polished apps on every platform.
- Apprise: A library and CLI that sends to dozens of notification services through one interface.
- Telegram / Slack webhooks: Use a chat app you already have, but your messages go through their servers.

## In depth
### Running it

```bash
docker run -d --name gotify -p 8080:80 -v gotify-data:/app/data gotify/server
```

Open the web UI (the default login is admin/admin, so change it immediately), create an **Application**, and copy its token.

### Sending notifications

```bash
curl "http://localhost:8080/message?token=<apptoken>" \
  -F "title=Backup finished" \
  -F "message=Nightly backup completed in 4m12s" \
  -F "priority=5"
```

From a cron job, notify only on failure:

```bash
0 3 * * * /usr/local/bin/backup.sh || curl -s "https://gotify.example.com/message?token=<apptoken>" -F "title=Backup FAILED" -F "message=Check the server logs" -F "priority=8"
```

Markdown formatting is enabled by sending JSON with `"extras": {"client::display": {"contentType": "text/markdown"}}`.

### Good to know
- Put it behind your reverse proxy (Caddy, Traefik or nginx) with HTTPS, and make sure WebSocket upgrades are passed through.
- Priorities control how loudly the Android app notifies you, so use high values only for genuinely urgent alerts.
