---
license: MIT
language: Rust
---

## Features
- Code-shaped patterns: Write the pattern in the target language, with `$VAR` for one node and `$$$ARGS` for many.
- Rewrites: `-r` replaces matches using the captured variables, across a whole codebase.
- Interactive mode: `-i` shows each proposed change and asks before applying it.
- Lint rules in YAML: Define rules with messages and fixes, then run `ast-grep scan` locally or in CI.
- Many languages: Built on tree-sitter, covering JavaScript, TypeScript, Python, Go, Rust, Java and many more.
- Fast: Written in Rust and runs in parallel across files.

## Strengths
- Far fewer false matches than regex, because it understands the code's structure.
- Patterns are easy to read because they look like the code you're searching for.
- One tool for searching, bulk refactors and custom lint rules.
- Coding agents use it for precise, reviewable bulk edits.

## Watch out for
- Matching is syntax-only: it doesn't know types, so it can't tell two functions with the same name apart.
- A pattern has to be valid, parseable code, which can take some practice for partial snippets.
- Complex rules (relational conditions such as `inside` or `has`) need the YAML rule format and some learning.

## Alternatives
- Semgrep: Similar pattern matching, with a large security rule registry and a commercial platform.
- Comby: Language-light structural matching that works on almost any text.
- jscodeshift or ts-morph: Full programmatic codemods for JavaScript and TypeScript, more powerful but more code to write.
- ripgrep: Fastest for plain text search, when structure doesn't matter.

## In depth
### Searching and rewriting

```bash
ast-grep run -p 'console.log($$$ARGS)' -l ts           # find every console.log call
ast-grep run -p 'var $A = $B' -r 'let $A = $B' -l js -i  # rewrite, confirming each change
ast-grep run -p '$A && $A()' -r '$A?.()' -l ts -U       # apply all changes without prompting
```

The binary is also installed as `sg` on most platforms, though some Linux systems already use that name.

### Lint rules for CI
Create a project with `ast-grep new`, then add rules as YAML files:

```yaml
id: no-await-in-loop
language: TypeScript
severity: warning
message: Avoid await inside loops; collect the promises and use Promise.all.
rule:
  pattern: await $EXPR
  inside:
    any:
      - kind: for_statement
      - kind: while_statement
    stopBy: end
```

`ast-grep scan` then checks the whole project and exits non-zero on errors, which makes it easy to add to CI next to your usual linter.

### Good to know
- The online playground on the website is the quickest way to get a pattern right.
- There are editor integrations through a language server, and npm, PyPI, Homebrew and Cargo packages.
- It's on the Thoughtworks Technology Radar (Trial, November 2026) as a tool for structural search, linting and rewriting.
