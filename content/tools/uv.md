---
license: MIT OR Apache-2.0
language: Rust
---

## Features
- Project management: `uv init`, `uv add` and `uv sync` manage pyproject.toml, a cross-platform `uv.lock` and the virtualenv for you.
- pip-compatible interface: `uv pip install` and `uv pip compile` are drop-in, much faster replacements for pip and pip-tools.
- Python versions: `uv python install 3.12` downloads and manages Python itself; no pyenv needed.
- Tools: `uvx ruff` runs a CLI tool in a throwaway environment; `uv tool install` installs it globally, like pipx.
- Single-file scripts: Inline dependency metadata (PEP 723) lets `uv run script.py` fetch what the script needs automatically.
- Workspaces and caching: Monorepo workspaces, plus a global cache with hard links that makes new environments near-instant.

## Strengths
- Dramatically faster installs and resolution than pip, which you feel immediately in CI and Docker builds.
- One tool replaces pip, pip-tools, virtualenv, pyenv, pipx and much of Poetry.
- Reproducible, cross-platform lockfiles by default.
- `uv run` removes "did you activate the venv?" confusion; it always uses the project environment.

## Watch out for
- It's young (first released in 2024) and moving fast; some long-tail pip behaviours differ.
- It's developed by a company (Astral), which some teams weigh up for core tooling.
- Mixing uv with Conda environments or unusual build setups can take some care.

## Alternatives
- pip + venv: The built-in baseline, universally supported but slow and with no lockfile.
- Poetry: A popular project manager with lockfiles; slower, with its own conventions.
- PDM / Hatch: Standards-based project managers with plugin ecosystems.
- pipx / pyenv: Single-purpose tools for CLI installs and Python versions.

## In depth
### A new project in four commands

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh   # or: winget install astral-sh.uv
uv init api && cd api
uv add fastapi "uvicorn[standard]"
uv run uvicorn main:app --reload
```

`uv add` updates pyproject.toml, resolves and writes `uv.lock`, and syncs `.venv`. Teammates and CI run `uv sync` to get exactly the same environment.

### Scripts with their own dependencies

```python
# /// script
# requires-python = ">=3.12"
# dependencies = ["httpx", "rich"]
# ///
import httpx
from rich import print
print(httpx.get("https://api.github.com").json())
```

```bash
uv run fetch.py   # creates a cached environment with httpx and rich, then runs
uv add --script fetch.py pandas   # add a dependency to the script's header
```

### In an existing pip project

```bash
uv venv
uv pip install -r requirements.txt
uv pip compile requirements.in -o requirements.txt   # replaces pip-tools
```

### Good to know
- In Docker, copying uv in and running `uv sync --frozen` gives fast, reproducible builds.
- `uvx` is short for `uv tool run`: `uvx black .`, `uvx httpie`.
