---
license: Apache-2.0
language: TypeScript
---

## Features
- Automatic notes: A second "observer" agent records what your coding agent does, such as decisions, fixes and files touched.
- Session start index: Each new session in a project begins with a short summary of what matters from earlier ones.
- Search on demand: The agent gets search tools to pull in older details only when needed, which keeps context small.
- Many agents: Records sessions from Claude Code, Codex, Cursor, OpenCode and about a dozen others. Copilot CLI, Goose, Roo Code, Warp and Zed can search memory but don't add to it.
- Local storage: Memory lives in `~/.claude-mem`; cloud sync is opt-in.
- Choice of note-taking model: The paid claude-mem observer, your own OpenRouter or Gemini key, or your Anthropic plan.

## Strengths
- Cuts the repeated "re-read the codebase, re-learn the gotchas" at the start of every session.
- Installs in one command and needs no changes to how you work.
- Shares one memory across several agents on the same project.
- Extremely popular and very actively developed.

## Watch out for
- The installer nudges you towards a paid observer, with a 30-day trial that asks for a card. Pass `--provider` or set `CLAUDE_MEM_ONLINE_OPTIN=false` to skip sign-in.
- Anonymous usage analytics are on by default; turn them off with `npx claude-mem telemetry disable`.
- Taking notes costs tokens. If the observer runs on your Anthropic plan, it uses your plan's allowance.
- `npm install -g claude-mem` installs only the library, not the hooks; use `npx claude-mem install`.
- Memory can preserve outdated facts; prune it when a project changes direction.

## Alternatives
- CLAUDE.md / AGENTS.md: Hand-written project notes. Fully under your control, but you have to keep them up to date.
- Your agent's built-in memory features: Simpler, usually tied to one agent.
- Beads: A git-backed issue tracker for agents. It keeps task state, not session history.

## In depth
### Install

```bash
npx claude-mem install                 # detects agents and asks which to set up
npx claude-mem install --ide opencode  # set up one agent only
```

Or inside Claude Code:

```text
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

Restart the agent. Observations start recording from your first prompt, and your second session in the project opens with memory from the first.

### How it keeps context small
Instead of pasting everything it knows into each session, claude-mem injects a short index at the start. When the agent needs more, for example "how did we fix the auth redirect last week?", it calls a search tool and reads just the relevant notes. That's how it can remember a lot without filling the context window.

### Good to know
- Run it in CI or non-interactive shells and the installer finishes without any account prompts.
- Review what's been stored now and then. It's your agent's long-term memory, and mistakes in it get repeated.
