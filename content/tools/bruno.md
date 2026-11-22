---
license: MIT
language: JavaScript (Electron)
---

## Features
- Collections as files: Each request is a plain-text `.bru` file in a folder you choose, usually inside your repo.
- Offline, no account: Runs locally and never syncs your collections to a cloud workspace.
- Environments and secrets: Per-environment variables, with secrets kept in a gitignored `.env`.
- Scripting and tests: Pre-request and post-response JavaScript, plus declarative assertions.
- CLI for CI: `bru run` executes a collection or folder and reports results, so API checks can run in pipelines.
- Imports: Bring in Postman and Insomnia collections and OpenAPI specs.

## Strengths
- API requests get versioned, reviewed and branched with the code they test.
- No vendor lock-in or forced login; the files are readable without Bruno.
- Fast, lightweight desktop app with a familiar Postman-like layout.
- The CLI turns your request collection into a smoke-test suite for free.

## Watch out for
- Collaboration happens through git, so there's no real-time shared workspace.
- Its ecosystem (mock servers, monitors, integrations) is smaller than Postman's.
- Some features are part of the paid edition; check whether you need them.

## Alternatives
- Postman: The most feature-rich API platform, cloud-first with accounts and workspaces.
- Insomnia: A similar desktop client; has moved towards cloud sync over the years.
- Hoppscotch: An open-source, web-first API client that can be self-hosted.
- HTTP files (VS Code REST Client, JetBrains HTTP Client): Requests in plain text right inside your editor.
- Scalar: An OpenAPI-first client if your API already has a spec.

## In depth
### What a request looks like

```text
meta {
  name: Get user
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/users/{{userId}}
  body: none
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

assert {
  res.status: eq 200
  res.body.id: eq {{userId}}
}
```

Environments live in `environments/local.bru` and `environments/staging.bru`, and secrets such as `token` come from a `.env` file you keep out of git.

### Running collections in CI

```bash
npm install -g @usebruno/cli
cd api-collection
bru run --env staging            # run everything
bru run users --env staging      # run one folder
```

A non-zero exit code on failed assertions makes this a cheap post-deploy smoke test.

### Migrating from Postman
Export your Postman collection as JSON, use Bruno's import option, and commit the generated folder. Review the scripts, since the scripting APIs are similar but not identical.
