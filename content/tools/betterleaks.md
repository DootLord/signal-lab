---
license: MIT
language: Go
---

## Features
- Many sources: Git history, folders, stdin, URLs, GitHub and GitLab orgs, users and PRs, Hugging Face, S3 and container images.
- Secret validation: Optionally checks whether a found credential is still active by calling the provider.
- Analysis and revocation: Can look up a valid credential's identity and permissions, and optionally revoke it.
- Prioritised findings: Ranks results by confidence, validation status and severity.
- Fewer false positives: Filters with Expr rules (using author, commit message and file path) and token-rarity checks for natural-language strings.
- Fast: Parallel by default, using keyword pre-filters and RE2 regexes.

## Strengths
- Built by the people who made Gitleaks, including its original author.
- Version 1 reads `.gitleaks.toml` and `.gitleaksignore`, so moving over from Gitleaks is easy.
- Knowing whether a leaked key still works makes triage much faster.
- A single small binary that fits in pre-commit hooks and CI.

## Watch out for
- Version 2 is in release candidates and changes some CLI, config and report details; package managers may still ship v1, so check which you have.
- It's much younger than Gitleaks or TruffleHog, with fewer ready-made CI integrations.
- Validation and analysis send the found credentials to the provider's API; they're off by default for good reason.

## Alternatives
- Gitleaks: The established scanner, still stable, but no longer led by its original author.
- TruffleHog: A mature scanner with credential verification and many detectors, AGPL-licensed.
- GitHub secret scanning and push protection: Built into GitHub and free for public repos, but GitHub-only.
- detect-secrets: Yelp's baseline-file approach, aimed at blocking new secrets in pre-commit.

## In depth
### Background
Zach Rice created Gitleaks, one of the most widely used open-source secret scanners. In early 2026 he no longer had full control of the Gitleaks repository and name, and started Betterleaks as its successor, with other Gitleaks maintainers and sponsorship from Aikido Security. Gitleaks itself remains available.

### Getting started

```bash
brew install betterleaks
betterleaks git .                 # scan this repo's history
betterleaks git . --include=merges
cat build.log | betterleaks stdin
```

Check `betterleaks --help` for the exact subcommands in your version: the README on the main branch documents v2, and the `v1.x` branch documents v1.

### In CI and pre-commit
Run it on every pull request so new secrets are caught before merge, and keep a scheduled full-history scan for anything that slipped through earlier. If you already have a `.gitleaks.toml` with custom rules or allowlists, start by pointing Betterleaks at the same file and compare its findings with Gitleaks' before switching over.

### Good to know
- To keep v1 next to v2 with Homebrew, use `brew install --cask betterleaks/tap/betterleaks@1` (installed as `betterleaks-v1`).
- The detection engine is explained in a short blog series linked from the README.
