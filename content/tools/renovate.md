---
license: AGPL-3.0
language: TypeScript
---

## Features
- Huge ecosystem coverage: Updates npm, Docker images, GitHub Actions, Terraform, Helm, Gradle, Maven, pip, Go modules, Cargo and dozens more.
- Grouping: Bundle related updates (all non-major updates, a whole monorepo like Angular or Babel, all linters) into one PR.
- Scheduling: Only open PRs at times you choose, such as "before 6am on Monday", so updates arrive in batches.
- Automerge: Merge low-risk updates automatically once your CI passes.
- Dependency Dashboard: A single issue listing every pending, scheduled and rate-limited update, with checkboxes to trigger them.
- Many platforms: GitHub, GitLab, Bitbucket, Azure DevOps, Gitea and Forgejo, hosted as an app or self-hosted.

## Strengths
- Far less PR noise than one-PR-per-package tools once grouping and schedules are set up.
- Presets (`config:recommended` and many more) give sensible behaviour with a two-line config.
- Covers things other bots miss, like Docker image digests, GitHub Action versions and versions pinned in arbitrary files via regex managers.
- Lock file maintenance keeps transitive dependencies fresh without touching package.json.

## Watch out for
- The configuration surface is enormous. Start from a preset and add rules gradually.
- Without grouping and schedules it can feel noisier than Dependabot at first.
- Self-hosting needs a bot token, a scheduled job and some care with secrets.
- Automerge is only as safe as your test suite.

## Alternatives
- Dependabot: Built into GitHub and simpler to start with, but less flexible grouping, scheduling and ecosystem coverage.
- Manual updates (npm outdated, ncu): Fine for tiny projects, but easy to fall behind on security fixes.
- Snyk / Socket: Focus on security vulnerabilities rather than keeping everything current.

## In depth
### How it works
Renovate scans your repository for dependency files using "managers" (one per ecosystem), looks up available versions from the relevant registries, and opens a branch and pull request for each update or group of updates. Its behaviour is driven by a `renovate.json` (or a section in package.json), which usually extends shared presets and then adds `packageRules` that match packages and change how they're handled.

### A calm, practical starting config

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "schedule": ["before 6am on monday"],
  "dependencyDashboard": true,
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "groupName": "all non-major dependencies",
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["major"],
      "groupName": "major dev dependencies"
    }
  ]
}
```

This produces one weekly PR for all minor and patch updates (merged automatically when CI is green), groups major dev-tool bumps, and leaves major runtime upgrades as individual PRs for a human to review.

### Getting started
- **Hosted:** install the Renovate app on your GitHub organisation. It opens an onboarding PR with a suggested config that you can edit before merging.
- **Self-hosted:** run the `renovate` CLI or Docker image on a schedule (a CI cron job works) with a token that can open PRs.

### Good to know
- Set `"rangeStrategy": "bump"` if you want package.json ranges updated as well as the lock file.
- The Dependency Dashboard is the best place to see what Renovate is doing and why something hasn't been updated.
