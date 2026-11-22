---
license: MIT OR Apache-2.0
language: Rust
---

## Features
- Formatter: Prettier-compatible formatting for JavaScript, TypeScript, JSX, JSON and CSS, fast enough to run on every save.
- Linter: Hundreds of lint rules, many ported from ESLint, typescript-eslint and popular plugins, with safe auto-fixes.
- One command: `biome check --write` formats, lints and organises imports in a single pass.
- Migration helpers: `biome migrate eslint` and `biome migrate prettier` translate your existing config.
- CI mode: `biome ci` runs everything read-only and fails the build on problems, with readable diagnostics.
- Editor integration: Official VS Code and JetBrains extensions plus an LSP server for other editors.

## Strengths
- One dependency and one config file (`biome.json`) instead of a tangle of ESLint and Prettier plugins.
- Very fast; large repos lint and format in a fraction of a second, which makes pre-commit hooks painless.
- Clear, well-written error messages that explain why a rule fired and how to fix it.
- Formatting output closely matches Prettier, so switching rarely produces a huge diff.

## Watch out for
- Not every ESLint rule or plugin has an equivalent. Check that the rules your team relies on exist before switching.
- Type-aware linting is far less complete than typescript-eslint with full type information.
- Support for framework files such as Vue, Svelte and Astro is still partial compared with plain JS/TS.
- The plugin system is young, so custom rules aren't as easy to write as in ESLint.

## Alternatives
- ESLint + Prettier: The established combination with the biggest rule and plugin ecosystem, but slower and more config to maintain.
- Oxlint: Another very fast Rust linter from the Oxc project. Often used alongside ESLint rather than replacing formatting.
- dprint: A fast, pluggable formatter if you only want to replace Prettier.
- Deno lint and fmt: Built in if you're already on Deno.

## In depth
### Why teams switch
Most JavaScript projects run two tools that overlap and occasionally fight: ESLint for correctness and Prettier for style, plus a stack of plugins and shared configs to keep them in sync. Biome does both jobs in one Rust binary with one config. The speed matters in practice: linting becomes cheap enough to run on every save and in every pre-commit hook without anyone noticing.

### Migrating an existing project

```bash
npm i -D -E @biomejs/biome
npx @biomejs/biome init
npx @biomejs/biome migrate eslint --write
npx @biomejs/biome migrate prettier --write
npx @biomejs/biome check --write .
```

Review the resulting diff, then remove ESLint, Prettier and their plugins from package.json once you're happy.

### A typical config

```json
{
  "formatter": { "indentStyle": "space", "indentWidth": 2, "lineWidth": 100 },
  "linter": {
    "rules": {
      "recommended": true,
      "suspicious": { "noExplicitAny": "warn" }
    }
  },
  "javascript": { "formatter": { "quoteStyle": "single" } }
}
```

### In CI and hooks
- Use `npx @biomejs/biome ci .` in your pipeline. It never writes files and exits non-zero on any issue.
- In a pre-commit hook, `biome check --write --staged` only touches staged files.
- Rules can be suppressed per line with `// biome-ignore lint/<group>/<rule>: reason`, and the reason is required, which keeps suppressions honest.
