---
license: MIT
language: TypeScript
---

## Features
- Any model provider: Anthropic, OpenAI, Google, OpenRouter, GitHub Copilot, Bedrock, local models via Ollama, and many more.
- Build and plan agents: Switch with Tab between a full-access agent and a read-only one that asks before running commands.
- Terminal UI and desktop app: A polished TUI, plus a beta desktop app for macOS, Windows and Linux.
- LSP integration: Uses language servers so the agent sees real diagnostics after editing.
- MCP and custom agents: Add MCP servers, custom commands and your own agent definitions.
- Client/server design: The agent runs as a server, so other clients and scripts (`opencode run`) can drive it.

## Strengths
- Open source and not tied to a vendor: switch models when prices or quality change.
- Reads `AGENTS.md`, so project instructions carry over from other agents.
- A large ecosystem: Worktrunk, Plannotator, claude-mem and many other agent tools support it.
- Very active development and community.

## Watch out for
- Output quality depends mostly on the model you pick; a cheap model makes a weak agent.
- The README now gives v2 install commands while the latest tagged release is 1.x, so check which version you're getting.
- Fast-moving: config options and commands change between releases.
- Another, unrelated Go project used the same name in 2025 (it became Charm's Crush), so older articles can be confusing.

## Alternatives
- Claude Code: Anthropic's agent; tightly tuned for Claude models.
- Codex CLI: OpenAI's open-source terminal agent.
- Aider: An earlier open-source terminal pair programmer with a git-commit-centred workflow.
- Kilo Code or Cline: Open-source agents that live inside VS Code.

## In depth
### First run

```bash
brew install anomalyco/tap/opencode-v2   # or: npm i -g @opencode/cli@latest
cd my-project
opencode           # opens the TUI
/connect           # add a provider and API key
/init              # write an AGENTS.md describing the project
```

Start in the plan agent to explore and agree an approach, then press Tab to switch to build and let it make the changes.

### Non-interactive use

```bash
opencode run "Add input validation to src/api/users.ts and update the tests"
```

This is handy in scripts and CI. OpenCode also has a GitHub integration that responds to comments on issues and PRs.

### Good to know
- Configuration lives in `opencode.json` (project) or `~/.config/opencode/` (global): providers, MCP servers, permissions and custom agents.
- Permissions can be set per tool (for example, always ask before `bash`), which helps when trying a new model.
- `/share` creates a link to a session; skip it for private code.
