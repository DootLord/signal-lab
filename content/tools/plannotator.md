---
license: Apache-2.0
language: TypeScript
---

## Features
- Plan review: When your agent proposes a plan, it opens in the browser. Highlight text, comment, and approve or send it back.
- Code review: Review uncommitted changes, GitHub PRs or GitLab MRs, and send comments to the agent to fix.
- Guided review: An agent sorts a large diff into chapters, with the core change first.
- Annotate anything: Markdown files, folders, URLs, rendered HTML, or a live local dev server through a proxy.
- Inbox: One local window where several agents leave questions and files for you to answer when you're ready.
- Sharing: Send a plan to a teammate as a link and import their annotations.

## Strengths
- Line-level feedback is much more precise than retyping corrections in the chat.
- Works across many agents: Claude Code, Codex, OpenCode, Gemini CLI, Copilot CLI, Amp and more.
- Supports Git, Jujutsu, GitButler and Perforce for code review.
- Local-first: the review UI runs on your machine.

## Watch out for
- The installer configures hooks and commands in every agent it finds; check what it changed afterwards.
- Shared links can be read by anyone who has them. Large shares are uploaded (encrypted) and expire after 7 days. Set `PLANNOTATOR_SHARE=disabled` to turn sharing off.
- Pre-1.0 and changing fast, with new surfaces (Inbox, TUI, Herdr plugin) appearing often.
- Team workspaces are a separate, upcoming product.

## Alternatives
- Your agent's built-in plan mode: Approve or reject in the terminal, with feedback typed as chat.
- OpenSpec: Agree a written spec with the agent before it codes, rather than reviewing its plan afterwards.
- GitHub PR review: Familiar, but feedback doesn't flow back to the agent automatically.

## In depth
### Install

```bash
curl -fsSL https://plannotator.ai/install.sh | bash
# Windows PowerShell
irm https://plannotator.ai/install.ps1 | iex
```

After installing, plan mode is wired in through each agent's hooks, so no command is needed. The next plan your agent writes opens for review.

### Commands inside your agent

```text
/plannotator-review                    # review uncommitted changes
/plannotator-review <PR or MR URL>     # review a GitHub PR or GitLab MR
/plannotator-annotate docs/design.md   # annotate a document
/plannotator-last                      # annotate the agent's last message
```

On Codex, use `!plannotator review` and similar.

### From the shell

```bash
plannotator annotate http://localhost:5173   # comment on your running app
plannotator sessions                         # list open review sessions
plannotator inbox                            # open the multi-agent inbox
```

### Good to know
- A terminal-only version (Plannotator TUI) exists for working over SSH.
- Install only from the official `backnotprop/plannotator` repo or plannotator.ai; there are several forks and mirrors.
