---
license: MIT
language: Go
---

## Features
- One config file: Hooks and their commands live in `lefthook.yml` in the repo.
- Parallel commands: Runs a hook's commands at the same time for faster commits.
- Staged-file filtering: `{staged_files}` and `glob` limit each command to the files that matter.
- Auto-staging fixes: `stage_fixed: true` re-adds files that a formatter changed.
- Local overrides: `lefthook-local.yml` lets individual developers skip or change commands without editing the shared config.
- Any ecosystem: Published to npm, Homebrew, RubyGems, PyPI, Go, apt and winget.

## Strengths
- Fast, and needs no extra runtime: it's a single Go binary.
- One tool for monorepos that mix languages.
- The config is short and readable compared with Husky scripts plus lint-staged settings.

## Watch out for
- Hooks can always be skipped with `--no-verify`, so still run the same checks in CI.
- Every developer needs it installed; the npm package's install script helps, while other ecosystems need a setup step.
- It runs your commands but doesn't install linters for you, unlike the pre-commit framework.

## Alternatives
- Husky with lint-staged: The JavaScript default, with two tools and two configs to do the same job.
- pre-commit: A Python framework that also installs and pins the hook tools themselves, at the cost of speed.
- Plain .git/hooks scripts: No dependencies, but not shared through the repo by default.

## In depth
### A typical config

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    format:
      glob: "*.{js,ts,json,css}"
      run: npx biome format --write {staged_files}
      stage_fixed: true
    lint:
      glob: "*.{js,ts}"
      run: npx biome lint {staged_files}
    go-vet:
      glob: "*.go"
      run: go vet ./...

pre-push:
  commands:
    test:
      run: npm test
```

### Setup

```bash
npm install --save-dev lefthook   # installs the hooks for you
# or: brew install lefthook, then:
lefthook install                  # write the git hooks from lefthook.yml
lefthook run pre-commit           # run a hook manually
```

### Good to know
- `LEFTHOOK=0 git commit` skips hooks for one command; `lefthook-local.yml` (git-ignored) is the tidier way to change them for one person.
- `skip` options can disable commands during merges or rebases.
- It's maintained by Evil Martians and has been in active use since 2019.
