---
license: Apache-2.0
language: Python
---

## Features
- Repo map: Builds a compact map of your whole codebase (functions, classes, signatures) so the model understands context beyond the files you add.
- Edits real files: Applies changes directly to your working tree using edit formats tuned per model.
- Git-native: Every change becomes a commit with a descriptive message; `/undo` reverts the last one.
- Many models: Works with Claude, OpenAI, Gemini, DeepSeek, OpenRouter and local models via Ollama.
- Lint and test loop: Runs your linter and tests after edits and asks the model to fix failures (`--auto-test`).
- Architect mode: A reasoning model plans changes and a cheaper editor model applies them.

## Strengths
- Every AI edit is a small, reviewable, revertible git commit.
- Model-agnostic, so you can pick the best or cheapest model per task and switch any time.
- Runs in the terminal alongside your existing editor, with no IDE lock-in.
- Open source, with public benchmarks of how well different models edit code.

## Watch out for
- You pay for API tokens directly, and large repos with big context windows can get expensive.
- Results depend heavily on the model; weaker models make more broken edits.
- Auto-commits can clutter history; squash before merging, or disable them with `--no-auto-commits`.
- You need to manage which files are in the chat for focused, cheaper sessions.

## Alternatives
- Claude Code: Anthropic's terminal coding agent, more autonomous, with tools and sub-agents.
- OpenAI Codex CLI: OpenAI's terminal coding agent.
- Cursor / Windsurf: AI-first editors with agents built into the IDE.
- GitHub Copilot: Inline completions and an agent mode inside common editors.

## In depth
### How a session works
You start aider in a git repo and add the files you want changed. Aider sends your request along with those files and the repo map to the model, parses the model's edits (as diffs or search/replace blocks), applies them to disk, and commits. If you've configured lint or test commands, it runs them and feeds failures back to the model to fix.

### Getting started

```bash
python -m pip install aider-install && aider-install
cd your-repo
export ANTHROPIC_API_KEY=...        # or OPENAI_API_KEY, etc.
aider src/api/users.ts src/api/users.test.ts
```

Inside the chat:

```text
> Add pagination to listUsers with limit/offset query params and update the tests
/run npm test          # run a command and share its output with the model
/add src/db/queries.ts # bring another file into context
/drop src/api/users.test.ts
/undo                  # revert the last AI commit
/architect             # switch to plan-then-edit mode
```

### Good to know
- `--test-cmd "npm test" --auto-test` makes aider iterate until tests pass, or give up.
- `--watch-files` lets you write `AI!` comments in your editor and have aider act on them.
- A `.aider.conf.yml` in the repo can set the default model, lint and test commands for everyone.
