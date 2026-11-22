---
license: MIT
language: TypeScript (Vue)
---

## Features
- Interactive API reference: Renders an OpenAPI or Swagger document as a clean, searchable reference site.
- Built-in API client: Readers can send real requests from the docs, with authentication and parameters pre-filled.
- Code samples: Generates request examples for many languages and HTTP clients automatically.
- Framework integrations: Drop-in packages for popular server frameworks (Express, Hono, Fastify, NestJS, FastAPI, ASP.NET and more).
- Offline-first API client: A standalone desktop and web client built around OpenAPI, as an alternative to Postman.
- Theming: Several built-in themes plus custom CSS, so docs can match your brand.

## Strengths
- Much more pleasant to read and use than default Swagger UI, with no extra work beyond pointing it at your spec.
- Open source and self-hostable; you can serve it from your own app.
- Keeps docs honest: generated from the same OpenAPI document your server exposes.
- The client and the reference share one mental model, so testing an endpoint is one click from reading about it.

## Watch out for
- It's only as good as your OpenAPI document; sparse specs make sparse docs.
- Some features (hosted docs, registry, team collaboration) are part of Scalar's commercial platform rather than the open-source packages.
- Integration package APIs have changed between major versions, so follow the current docs for your framework.

## Alternatives
- Swagger UI: The long-standing default renderer, widely supported but dated in look and usability.
- Redoc: Polished, read-only three-panel docs without a built-in request runner.
- Stoplight Elements: Embeddable OpenAPI docs components with a "try it" console.
- Postman / Bruno: Dedicated API clients if you mostly need to send requests, not publish docs.

## In depth
### Where it fits
If your backend already produces an OpenAPI document (many frameworks generate one automatically), Scalar turns it into documentation people actually want to use: a navigable reference, request examples in their language of choice, and a "send request" panel that works against your real API. Because it reads the spec at runtime, the docs update whenever the API does.

### Typical setups
- **Inside your app:** install the integration package for your framework and mount it on a route such as `/docs`, pointing it at your `/openapi.json`. Your API now ships its own documentation.
- **Static site:** load Scalar's API reference script on a plain HTML page with the URL of your spec, then deploy it anywhere static files are served.
- **API client:** use the desktop app or the web client to import an OpenAPI file and explore or test endpoints, much like Postman but spec-first.

```bash
npm install @scalar/api-reference
# then follow the guide for your framework at scalar.com
```

### Good to know
- Getting good docs is mostly about the spec: add summaries, descriptions, examples and error responses to your OpenAPI document and Scalar will show them.
- It supports both OpenAPI 3.x and Swagger 2.0 documents.
