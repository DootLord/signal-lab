---
license: Apache-2.0
language: Rust
---

## Features
- Watch anything: Re-runs any command when files change, for any language or tool.
- Ignore-aware: Respects `.gitignore` and `.ignore`, so build output and dependencies don't trigger loops.
- Filters: By extension (`-e ts,tsx`), glob (`-f '*.sql'`) or specific paths (`-w src`).
- Restart mode: `-r` kills and restarts long-running processes like dev servers on change.
- Debouncing: Batches rapid bursts of changes (formatters, git checkouts) into a single run.
- Event details: Exposes which paths changed to the command via environment variables.

## Strengths
- One watcher for every project, instead of learning each tool's own `--watch` flag.
- Handles servers properly: it waits for the process to stop before restarting, with configurable signals.
- Fast and lightweight, using native file-system notifications on each OS.

## Watch out for
- Docker volumes, network shares and some VMs don't deliver file events reliably; use `--poll` there.
- Linux has an inotify watch limit; huge trees may need it raised.
- Some tools' built-in watch modes are smarter (incremental rebuilds, hot reload), so use those when they exist.

## Alternatives
- nodemon: The classic Node.js restarter, with Node-centric defaults.
- entr: A minimal Unix tool that takes a file list on stdin.
- Built-in watch modes (vitest, tsc -w, cargo watch, node --watch): Usually best when available, because they're incremental.

## In depth
### Common uses

```bash
# Re-run tests when TypeScript files change, clearing the screen first
watchexec -c -e ts,tsx -- npm test

# Restart a Go server on change
watchexec -r -e go -- go run ./cmd/server

# Regenerate code when SQL changes
watchexec -w db/queries -e sql -- sqlc generate

# Re-run the linter whenever Python files change
watchexec -e py -- ruff check .
```

### How it works
watchexec subscribes to the operating system's file-change notifications (inotify on Linux, FSEvents on macOS, ReadDirectoryChangesW on Windows), filters events through your ignore files and filters, debounces bursts, then runs your command. In restart mode (`-r`) it sends a signal to the running process (SIGTERM by default, configurable with `--signal`), waits for it to exit, and starts it again.

### Good to know
- Put the command after `--` so watchexec doesn't try to parse its flags.
- `--postpone` waits for the first change before running the command at all.
- On Windows, the shell defaults to PowerShell or cmd; use `--shell` to pick one explicitly.
