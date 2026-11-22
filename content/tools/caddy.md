---
license: Apache-2.0
language: Go
---

## Features
- Automatic HTTPS: Obtains and renews certificates from Let's Encrypt or ZeroSSL by itself, and redirects HTTP to HTTPS.
- Simple config: A Caddyfile site is often two or three lines; a full JSON config and admin API are available for automation.
- Reverse proxy: Load balancing, health checks, retries, header manipulation and WebSocket support built in.
- Static file server: Compression, ranges, directory browsing and SPA fallbacks with `try_files`.
- Modern protocols: HTTP/2 and HTTP/3 out of the box.
- Local HTTPS: An internal CA issues trusted certificates for localhost and internal hostnames.

## Strengths
- Removes a whole class of outages: expired certificates and forgotten renewal cron jobs.
- Configs are short and readable, so they're easy to review and hard to get wrong.
- Secure defaults (modern TLS, HSTS-friendly) without copy-pasting hardening snippets.
- A single static binary with no dependencies.

## Watch out for
- Extra modules (DNS providers, rate limiting and so on) require a custom build with `xcaddy`.
- There are far fewer Stack Overflow answers and copy-paste snippets than for nginx.
- At very high scale, nginx and HAProxy have more tuning history and production lore.

## Alternatives
- nginx + certbot: The ubiquitous standard; very fast and flexible, but certificate management is a separate job.
- Traefik: Automatic HTTPS plus service discovery from Docker labels and Kubernetes, popular in container setups.
- HAProxy: A high-performance load balancer, more focused on TCP/HTTP proxying than serving files.

## In depth
### Caddyfile examples

```text
# A reverse proxy with automatic HTTPS
app.example.com {
    reverse_proxy localhost:3000
}

# A static single-page app with an API behind it
example.com {
    root * /srv/site
    encode zstd gzip
    handle /api/* {
        reverse_proxy localhost:8080
    }
    handle {
        try_files {path} /index.html
        file_server
    }
}

# Load balance across two app instances with health checks
api.example.com {
    reverse_proxy 10.0.0.11:8080 10.0.0.12:8080 {
        lb_policy least_conn
        health_uri /health
    }
}
```

```bash
caddy run --config Caddyfile     # foreground
caddy reload --config Caddyfile  # zero-downtime config reload
```

### How automatic HTTPS works
When a site block names a public domain, Caddy completes an ACME challenge with a certificate authority, stores the certificate, staples OCSP responses and renews well before expiry, all in the background. For `localhost` or internal names, it uses its own local CA instead (run `caddy trust` to install that CA on your machine).

### Good to know
- Point DNS at the server and open ports 80 and 443 before starting it, or certificate issuance will fail.
- Coolify and similar platforms often run Caddy or Traefik for you; you may already be using it.
