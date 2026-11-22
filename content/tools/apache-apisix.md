---
license: Apache-2.0
language: Lua (OpenResty / NGINX)
---

## Features
- Dynamic configuration: Routes, upstreams, plugins and certificates change at runtime through an Admin API, with no reloads or restarts.
- Plugin library: Authentication (key-auth, JWT, OpenID Connect), rate limiting, CORS, transformations, caching and observability (Prometheus, OpenTelemetry).
- Traffic management: Load balancing (round-robin, consistent hashing, EWMA, least connections), health checks, retries, canary releases and circuit breaking.
- Kubernetes ingress: An ingress controller and Gateway API support for cluster traffic.
- AI gateway: Plugins for proxying and rate-limiting LLM APIs, load balancing between model providers and observing token usage.
- Multi-language plugins: Write custom plugins in Lua, or in Go, Java, Python or WebAssembly through plugin runners.

## Strengths
- Hot configuration changes make it well suited to platforms where routes change constantly.
- High performance, built on the battle-tested NGINX/OpenResty core.
- An Apache Software Foundation project with open governance and no paid tier gating core features.
- One gateway for north-south (client) and east-west (service-to-service) traffic.

## Watch out for
- Operationally heavier than a plain reverse proxy: production setups typically run an etcd cluster for configuration.
- Custom plugins in Lua are a niche skill; external runners add latency.
- It's overkill for a single app behind a proxy; Caddy or nginx will do.

## Alternatives
- Kong: The best-known open-source API gateway, also NGINX/OpenResty-based, with an enterprise edition.
- Traefik: A simpler, container-native proxy with automatic service discovery.
- Envoy (with Envoy Gateway or Istio): A high-performance proxy at the heart of many service meshes.
- NGINX: Plenty for simple routing, but config changes need reloads and plugins are limited.

## In depth
### How it works
APISIX runs on OpenResty (NGINX plus LuaJIT). Instead of static config files, its routing table and plugin settings live in etcd and are pushed to every gateway node in real time. You manage them through the Admin API (or declaratively with the `adc` CLI or Kubernetes resources). A request is matched to a route, passes through the route's plugins (auth, limits, transforms), and is proxied to an upstream chosen by the load-balancing policy.

### Quick start
The getting-started guide provides a script that starts APISIX and etcd in Docker:

```bash
curl -sL https://run.api7.ai/apisix/quickstart | sh
```

Then create a route that proxies `/ip` to a public test service:

```bash
curl -i "http://127.0.0.1:9180/apisix/admin/routes" -X PUT -d '{
  "id": "getting-started-ip",
  "uri": "/ip",
  "upstream": { "type": "roundrobin", "nodes": { "httpbin.org:80": 1 } }
}'

curl "http://127.0.0.1:9080/ip"
```

Adding rate limiting is just another plugin on the route, with no restart needed.

### Good to know
- Outside the quickstart, protect the Admin API with an admin key and keep it off the public network.
- For GitOps-style workflows, manage configuration declaratively rather than with ad-hoc Admin API calls.
- Check the current docs before following older tutorials, as commands and defaults have changed between major versions.
