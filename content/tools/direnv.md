---
license: MIT
language: Go
---

## Features
- Automatic loading: Runs a directory's `.envrc` when you `cd` in and reverts every change when you leave.
- Security allowlist: Nothing runs until you `direnv allow` it, and you must allow again after every edit.
- Standard library: Helpers like `dotenv`, `PATH_add bin`, `source_up`, `layout python` and `use nix`.
- Shell support: bash, zsh, fish, tcsh, elvish and more.
- Editor integrations: Plugins for VS Code, Vim and Emacs so editors see the same environment.

## Strengths
- Per-project environment variables without polluting your global shell profile.
- Switching projects just works: the right credentials, endpoints and PATH entries follow you.
- The allowlist means a cloned repo can't silently run code in your shell.
- Mature, simple and fast.

## Watch out for
- Re-approving after every `.envrc` change is safe but occasionally tedious.
- `.envrc` is bash syntax even if you use fish or zsh interactively.
- Secrets in `.envrc` or `.env` files are plain text; keep them out of git and consider a secrets manager.
- Windows support is limited compared with macOS and Linux.

## Alternatives
- mise [env]: If you already use mise, it can set per-project variables too.
- dotenv libraries: Load `.env` inside the app, which works everywhere but only for that process, not your shell.
- autoenv: A similar idea with a simpler, older implementation.

## In depth
### Setup

```bash
brew install direnv          # or apt install direnv
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc   # or zsh/fish equivalents
```

### An example .envrc

```bash
# Load variables from .env (kept out of git)
dotenv

# Put the project's local scripts and node_modules/.bin on PATH
PATH_add bin
PATH_add node_modules/.bin

# Project-specific settings
export AWS_PROFILE=myapp-dev
export DATABASE_URL=postgres://localhost/myapp_dev

# Inherit settings from a parent folder's .envrc (useful in monorepos)
source_up_if_exists
```

```bash
direnv allow   # approve it once
cd ..          # variables unloaded
cd -           # variables loaded again
```

### Good to know
- Commit a `.envrc.example` and gitignore the real `.envrc` or `.env`.
- `layout python` creates and activates a virtualenv automatically for Python projects.
- `direnv status` shows what's loaded and why.
