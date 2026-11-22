---
license: CC0-1.0
language: Rust
---

## Features
- Named recipes: Define project commands once in a `justfile` and run them with `just <recipe>`.
- Arguments and defaults: Recipes take parameters (`just deploy staging`), with defaults and variadic arguments.
- Dependencies: Recipes can run other recipes first, like `test: build`.
- Self-documenting: `just --list` shows every recipe with the comment written above it.
- Any language: Shebang recipes run their body with Python, Node, Bash or anything else.
- .env loading: `set dotenv-load` reads a `.env` file into every recipe's environment.

## Strengths
- Gives every project a discoverable menu of commands, which is great for onboarding and for remembering your own projects.
- Avoids Make's pitfalls: no tab-versus-space traps, no `.PHONY` declarations, and clear error messages.
- Works from any subdirectory; it searches upwards for the nearest justfile.
- Cross-platform, with settings to choose the shell on Windows.

## Watch out for
- It's a command runner, not a build system: it doesn't skip work based on file timestamps like Make does.
- It's one more tool for contributors to install. Mention it in the README, or install it via mise or your package manager.
- It has its own small syntax to learn, including string interpolation with `{{ }}`.

## Alternatives
- Make: Available everywhere and great for real file-based builds, but awkward as a plain task runner.
- npm/pnpm scripts: Fine in JavaScript projects, but cramped for multi-line or cross-language tasks.
- Task (go-task): A similar runner with YAML config and file-based up-to-date checks.
- mise tasks: Handy if you already use mise for tool versions.

## In depth
### Why it's popular
Most projects accumulate commands that live in people's heads, shell history or a README: how to run tests with the right flags, reset the database, build a release, or deploy. `just` puts them in one readable file at the root of the repo. Running `just` with no arguments runs the first recipe; `just --list` shows the menu.

### An example justfile

```make
set dotenv-load

# Show available recipes
default:
    @just --list

# Install dependencies
setup:
    npm ci

# Run the test suite (pass extra args, e.g. `just test --watch`)
test *args:
    npx vitest {{args}}

# Reset the local database
db-reset: setup
    rm -f data/app.sqlite
    npm run migrate

# Deploy to an environment
deploy env="staging":
    ./scripts/deploy.sh {{env}}
```

```bash
just            # lists recipes
just test --watch
just deploy production
```

### Good to know
- Prefix a line with `@` to stop just echoing the command before running it.
- `just --choose` gives an interactive picker if fzf is installed.
- Editor plugins provide syntax highlighting for justfiles in VS Code, Vim and JetBrains IDEs.
