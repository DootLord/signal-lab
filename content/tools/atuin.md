---
license: MIT
language: Rust
---

## Features
- Rich history: Stores every command in SQLite with its directory, exit code, duration, host and session.
- Full-screen search: Replaces Ctrl-R (and optionally the up arrow) with a fast fuzzy search UI.
- Filter modes: Search global history, this host, this session or just the current directory.
- Encrypted sync: Optional end-to-end encrypted sync between machines, via Atuin's server or your own.
- Stats: `atuin stats` shows your most-used commands and patterns.
- Imports: Brings in your existing bash, zsh or fish history on day one.

## Strengths
- You stop losing commands: history survives across terminals, sessions and machines.
- Directory filtering is a superpower: "what did I run in this repo last time?" is one keypress away.
- Seeing exit codes and durations makes it easy to find the command that worked rather than the typo before it.
- Sync is end-to-end encrypted, and the server is open source if you'd rather self-host.

## Watch out for
- Bash support relies on bash-preexec or ble.sh; zsh and fish integrate more smoothly.
- Taking over the up arrow surprises some people. Use `--disable-up-arrow` if you only want Ctrl-R.
- History can contain secrets. Atuin filters common token patterns, but review what you sync.

## Alternatives
- fzf Ctrl-R: Fuzzy search over your normal history file, simple and lightweight, but no extra context or sync.
- McFly: Neural-network-ranked history search, local only.
- hstr: A lightweight history browser for bash and zsh.

## In depth
### How it works
Atuin installs a shell hook that records each command just before and after it runs, so it can capture the working directory, exit status and duration. The data goes into a local SQLite database. The search UI queries that database, ranking and filtering by context. If you enable sync, entries are encrypted on your machine with a key only you hold before being uploaded.

### Getting set up

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh
atuin import auto        # pull in existing history
# restart your shell, then press Ctrl-R

# optional: sync between machines
atuin register -u <username> -e <email>
atuin sync
# on another machine
atuin login -u <username>
```

### Useful settings
In `~/.config/atuin/config.toml`:

```toml
filter_mode_shell_up_key_binding = "directory"   # up arrow searches this directory first
search_mode = "fuzzy"
style = "compact"
```

### Good to know
- Press Ctrl-R repeatedly inside the search UI to cycle between filter modes.
- `atuin search --exit 0 --cwd . docker` finds successful docker commands run in the current directory, which is handy in scripts.
- Your encryption key lives in `~/.local/share/atuin/key`; back it up, or synced history can't be decrypted on a new machine.
