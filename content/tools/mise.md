---
license: MIT
language: Rust
---

## Features
- Tool versions per project: `mise use node@22` pins a version in `mise.toml`, and the right version activates when you enter the folder.
- Hundreds of tools: Node, Python, Go, Java, Ruby, Terraform, kubectl and more, installed from several backends (aqua, GitHub releases, npm, pipx, cargo, asdf plugins).
- Environment variables: An `[env]` section sets per-project variables and can load `.env` files, much like direnv.
- Tasks: A `[tasks]` section defines project commands, run with `mise run`.
- Reads existing files: Understands `.nvmrc`, `.python-version` and `.tool-versions`, so you can adopt it without changing the repo.
- CI friendly: `mise install` sets up every pinned tool in one step, and there is an official GitHub Action.

## Strengths
- One tool replaces nvm, pyenv, rbenv, asdf and often direnv, with one config file per project.
- Fast: it modifies PATH directly instead of routing every command through slow shims.
- Onboarding becomes "install mise, run `mise install`".
- Pinned versions in git mean CI and every laptop run the same toolchain.

## Watch out for
- It needs shell activation (`mise activate`) or shims to work well. Follow the setup step for your shell.
- Config files from other people must be trusted (`mise trust`) before they take effect, which is a security feature that can surprise you the first time.
- Plugin-based (asdf) backends are slower and less vetted than the built-in or aqua backends.
- Development moves quickly, so read the changelog when upgrading.

## Alternatives
- asdf: The original multi-language version manager; mise is compatible with its plugins and files.
- nvm / pyenv / rbenv: Single-language managers. Simple, but you need several.
- Volta: Node-focused, with fast shims and per-project pinning.
- Devbox / Nix: Fully reproducible environments, more powerful but much heavier to learn.

## In depth
### How it works
mise keeps installed tool versions in a shared cache and, when you `cd` into a project, adjusts your PATH so the versions listed in that project's config come first. It finds config by walking up from the current directory, so a monorepo can have defaults at the root and overrides in subfolders. Global defaults live in `~/.config/mise/config.toml`.

### An example mise.toml

```toml
[tools]
node = "22"
python = "3.12"
terraform = "1.9"

[env]
DATABASE_URL = "postgres://localhost/app_dev"
_.file = ".env"

[tasks.test]
run = "npm test"
description = "Run unit tests"

[tasks.dev]
run = "npm run dev"
depends = ["install"]

[tasks.install]
run = "npm ci"
```

```bash
curl https://mise.run | sh
echo 'eval "$(mise activate bash)"' >> ~/.bashrc
mise install         # installs everything pinned in mise.toml
mise run test
mise ls              # what's installed and active
```

### Good to know
- `mise use -g node@lts` sets a global default; `mise use` without `-g` writes to the project's config.
- `mise exec -- <cmd>` runs a single command with the project's tools, which is useful in scripts and CI.
- `mise doctor` diagnoses activation and PATH problems.
