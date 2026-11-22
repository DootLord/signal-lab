---
license: MIT
language: Go
---

## Features
- Dependency graph: Issues link with blocks, parent-child, related and duplicate relations.
- Ready work: `bd ready` lists tasks with no open blockers, so an agent always knows what to pick up next.
- Atomic claims: `bd update <id> --claim` sets the assignee and status in one step, so two agents don't take the same task.
- Collision-free IDs: Hash-based IDs such as `bd-a1b2`, plus hierarchical IDs for epics and subtasks.
- Agent memory: `bd remember` stores project facts that `bd prime` injects into an agent's context later.
- Dolt storage: A version-controlled SQL database with branching, cell-level merges and sync between machines.

## Strengths
- Agents keep track of long, multi-session work instead of rewriting a TODO file each time.
- JSON output and short commands suit agents better than a web issue tracker does.
- `bd init` sets up AGENTS.md and integrations for Claude Code, Codex, Cursor and others.
- Stealth mode lets you use it on a shared project without committing anything.

## Watch out for
- It's another system your agents (and teammates) have to learn, and agents must be told to use it.
- Upgrades can include database schema migrations, and the upgrade guide should be followed carefully for shared databases.
- It's young and changes quickly; the repo has already moved from steveyegge/beads to gastownhall/beads.
- It's a task tracker for agents, not a replacement for your team's product issue tracker.

## Alternatives
- Markdown plan files: Zero setup, but agents rewrite, duplicate and forget them over long tasks.
- GitHub Issues through the gh CLI: Shared with the team, but slower and noisier for fine-grained agent tasks.
- Backlog.md: A Markdown-file task board that both people and agents can read.
- Linear or Jira through MCP: Keeps agent work in the team's tracker, with more overhead per task.

## In depth
### Getting started

```bash
brew install beads          # or: npm install -g @beads/bd
cd your-project
bd init                     # creates the database and updates AGENTS.md
bd setup claude             # optional: hooks and settings for Claude Code
```

Install the CLI once and use it everywhere; you don't clone the Beads repo into your project.

### How agents use it

```bash
bd create "Add rate limiting to the API" -p 1
bd create "Write load test for rate limiter" -p 2
bd dep add <test-id> <limiter-id>      # the test waits for the limiter
bd ready                               # only the limiter task is ready
bd update <limiter-id> --claim
bd close <limiter-id>                  # now the test task becomes ready
```

At the start of a session the agent runs `bd prime` to get workflow guidance and stored project memories, then asks `bd ready` for work. Closed tasks are compacted over time, so old detail doesn't fill the context window.

### Good to know
- `bd init --stealth` keeps Beads local for personal use on shared repos; `--contributor` routes planning to a separate repo when working on a fork.
- If your agent isn't covered by `bd setup`, `bd onboard` prints a snippet to paste into its instruction file.
- Beads was created by Steve Yegge, and the docs live at beads.gascity.com.
