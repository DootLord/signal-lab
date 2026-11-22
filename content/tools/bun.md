---
license: MIT
language: Zig
---

## Features
- JavaScript runtime: Runs JavaScript, TypeScript and JSX directly, with no build step or ts-node, on Apple's JavaScriptCore engine.
- Package manager: `bun install` reads your existing package.json and installs from the npm registry, typically far faster than npm.
- Test runner: `bun test` provides a Jest-compatible API (describe, it, expect, mocks, snapshots) with watch mode.
- Bundler: `bun build` bundles for the browser or the server and can compile a script into a single executable.
- Batteries included: Built-in HTTP server (Bun.serve), SQLite driver (bun:sqlite), file I/O, password hashing, shell scripting (Bun.$) and an S3 client.
- Node.js compatibility: Implements most node:* modules and Node-API, so the majority of npm packages work unchanged.

## Strengths
- Replaces four or five separate tools (runtime, package manager, test runner, bundler, TS loader) with one binary.
- Very fast installs, start-up and test runs, which you notice most in CI and large monorepos.
- TypeScript and JSX just work: no tsconfig gymnastics to run a script.
- Easy to adopt gradually: you can use only `bun install` or `bun test` in an existing Node project.

## Watch out for
- Node.js compatibility is very good but not perfect; some native addons and less common APIs can behave differently.
- It's younger than Node, so there are fewer production war stories and less tooling built around it.
- Running production on Bun means your runtime differs from most hosting docs and examples, which assume Node.
- JavaScriptCore performance characteristics differ from V8, so benchmark your own workload rather than trusting headline numbers.

## Alternatives
- Node.js: The default, most compatible runtime. Pair it with npm/pnpm, Vitest and a bundler for the same feature set.
- Deno: Also runs TypeScript natively, with a security-permissions model and a built-in toolchain. Strong on web standards.
- pnpm: If you only want faster, disk-efficient installs while staying on Node.
- Vitest: If you only want a fast, modern test runner for a Node or Vite project.

## In depth
### How it works
Bun is a single executable written in Zig that embeds Apple's JavaScriptCore (the engine in Safari) rather than V8. Because the runtime, transpiler, package manager and test runner live in one binary, it can skip a lot of the glue other toolchains need. TypeScript is transpiled on the fly (types are stripped, not checked), and module resolution follows Node's rules so existing projects keep working.

### Adopting it gradually
You don't have to switch runtimes to benefit. A common path is:

1. Use `bun install` in an existing Node project. It reads package.json and writes a `bun.lock` file, and Node can still run the result.
2. Try `bun test` on your test suite. Most Jest-style tests run unchanged.
3. Use `bun run` for scripts and TypeScript one-offs instead of ts-node or tsx.
4. Only then consider running the app itself on Bun, after testing it properly.

### A small server and test

```ts
// server.ts
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/health') return Response.json({ ok: true });
    return new Response('Hello from Bun');
  },
});
console.log(`Listening on ${server.url}`);
```

```ts
// math.test.ts
import { expect, test } from 'bun:test';
test('adds', () => expect(1 + 2).toBe(3));
```

```bash
bun run server.ts
bun test --watch
```

### Good to know
- `bun build ./cli.ts --compile --outfile mycli` produces a standalone executable, which is handy for distributing internal CLIs.
- `bunx` is Bun's equivalent of `npx`.
- Type checking still needs `tsc --noEmit` (or your editor). Bun strips types for speed but does not check them.
