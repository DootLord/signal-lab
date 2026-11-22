---
license: MIT
language: Python
---

## Features
- Three interfaces: `mitmproxy` (terminal UI), `mitmweb` (browser UI) and `mitmdump` (scriptable, like tcpdump for HTTP).
- TLS interception: Generates certificates on the fly from its own CA, so you can read HTTPS traffic from clients you control.
- Edit and replay: Change a request or response, re-send it, or replay a whole saved session.
- Python add-ons: Hook into every request and response with a short Python script.
- Many proxy modes: Regular, reverse, transparent, WireGuard, SOCKS5 and local capture of a single process.
- HTTP/2, WebSockets and more: Inspects modern protocols as well as plain HTTP/1.1.

## Strengths
- Shows what non-browser clients (mobile apps, CLIs, SDKs, backend services) really send.
- Scriptable in Python, so you can mock, rewrite or record traffic for tests.
- Free, open source and mature, with active development.
- Local capture mode means no proxy settings to configure for many apps.

## Watch out for
- You must install and trust its CA certificate on the client, which is harder on recent Android versions.
- Apps that use certificate pinning can't be intercepted without modifying them.
- Local capture on macOS needs a system extension, and on Linux it only sees outgoing connections.
- Only intercept traffic you're allowed to inspect.

## Alternatives
- Charles Proxy: A polished commercial GUI proxy for desktop.
- Proxyman: A macOS-native commercial proxy with a friendly interface.
- HTTP Toolkit: Open-core, with one-click interception for browsers, Node, Android and Docker.
- Burp Suite: The security-testing standard, aimed at penetration testers rather than app debugging.

## In depth
### Getting started

```bash
brew install --cask mitmproxy    # or: uv tool install mitmproxy
mitmweb                          # proxy on :8080, UI on http://127.0.0.1:8081
```

Point a client at `localhost:8080` as its HTTP proxy, then visit `http://mitm.it` from that client to download and trust the CA certificate. For command-line tools:

```bash
curl --proxy http://localhost:8080 --cacert ~/.mitmproxy/mitmproxy-ca-cert.pem https://example.com
```

### Capturing one app without proxy settings

```bash
mitmproxy --mode local            # everything on this machine
mitmproxy --mode local:curl       # only processes named curl
mitmproxy --mode local:1234       # only PID 1234
```

### Scripting with add-ons

```python
# add_header.py
def request(flow):
    flow.request.headers["x-debug"] = "1"

def response(flow):
    if flow.request.path.startswith("/api/flags"):
        flow.response.text = '{"newCheckout": true}'
```

```bash
mitmdump -s add_header.py
```

This makes it easy to force feature flags, inject failures, or record API traffic for test fixtures.

### Good to know
- Saved flows (`-w flows.mitm`) can be replayed later with `--server-replay` to mock a backend.
- The docs on docs.mitmproxy.org cover certificate setup for each platform in detail.
