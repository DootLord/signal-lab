---
license: MIT
language: JavaScript
---

## Features
- Many monitor types: HTTP(S), keyword and JSON query, TCP port, ping, DNS, Docker container, push (heartbeat), databases, game servers and more.
- Notifications: Around 90 integrations, including Slack, Discord, Telegram, Teams, email, ntfy, Gotify and webhooks.
- Status pages: Public pages with your own domain, grouped services and incident messages.
- Certificate expiry: Warns before TLS certificates run out.
- Maintenance windows: Pause alerts during planned work.
- Prometheus metrics: A `/metrics` endpoint for existing dashboards.

## Strengths
- Running in minutes: one container, then everything is configured in a clean web UI.
- Light enough for a small VPS or a Raspberry Pi.
- Push monitors make it a simple dead-man's switch for cron jobs and backups.
- Very popular and actively maintained, with a large community.

## Watch out for
- It checks from one location (wherever you run it). If that host or its network goes down, you're blind; run it somewhere other than the things it watches.
- It isn't a metrics or APM tool: no traces, no detailed performance history.
- Configuration lives in the UI and database, so there's no first-class config-as-code. Back up the data volume.
- There's no clustering or high availability.

## Alternatives
- UptimeRobot, Better Stack, Pingdom: Hosted, multi-region checks, with free tiers and paid plans.
- Gatus: Self-hosted, configured in YAML, so monitors live in git.
- Prometheus Blackbox Exporter: For teams already on Prometheus and Grafana.
- Healthchecks.io: Focused on cron job heartbeats, hosted or self-hosted.

## In depth
### Run it

```bash
docker run -d --restart=always -p 3001:3001 \
  -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:2
```

Or with Compose:

```yaml
services:
  uptime-kuma:
    image: louislam/uptime-kuma:2
    restart: unless-stopped
    ports: ["3001:3001"]
    volumes:
      - uptime-kuma:/app/data
      # optional: monitor containers on this host
      - /var/run/docker.sock:/var/run/docker.sock:ro
volumes:
  uptime-kuma:
```

### Heartbeat for a cron job
Create a Push monitor and copy its URL, then call it at the end of the job:

```bash
0 3 * * * /usr/local/bin/backup.sh && curl -fsS "https://kuma.example.com/api/push/AbC123?status=up&msg=OK"
```

If the ping doesn't arrive in time, you get an alert.

### Good to know
- Version 2 adds MariaDB/MySQL as an alternative to the built-in SQLite database.
- Put it behind a reverse proxy (Caddy works well) for HTTPS, and turn on 2FA for the admin account.
- Pair it with Gotify or ntfy for push alerts that don't depend on a third-party chat service.
