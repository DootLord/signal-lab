---
license: Apache-2.0
language: Go
---

## Features
- Hybrid pipeline: Ordinary code picks which files to review, bundles related files and matches rules; an LLM agent does the reasoning.
- Line-precise comments: Separate positioning and reflection steps keep comments on the right lines and filter out weak ones.
- Diff and full-file modes: `ocr review` for changes; `ocr scan` audits whole files or directories with no diff.
- Any LLM: Built-in providers including OpenAI and Anthropic, plus custom OpenAI-compatible endpoints.
- Delegation mode: Runs as a skill inside Claude Code, Codex or Cursor, using that agent's model with no separate API key.
- CI-friendly output: JSON results, resumable sessions, and a VS Code extension.

## Strengths
- Built for precision: fewer false alarms than asking a general agent to "review this PR".
- Cheap to run. Alibaba reports about a ninth of the tokens Claude Code used on the same benchmark.
- Battle-tested: two years as Alibaba's internal review assistant before release.
- Review rules are configurable per path, so teams can encode their own standards.

## Watch out for
- It deliberately trades recall for precision, so it will miss some real issues.
- The benchmark figures come from Alibaba's own dataset; test it on your code before trusting the numbers.
- Needs Git 2.41 or later.
- Native mode needs its own model endpoint and key; a Claude or ChatGPT subscription login doesn't count.

## Alternatives
- A general coding agent with a review prompt: Flexible, but tends to skip files and drift on line numbers in big diffs.
- Hosted review bots (CodeRabbit, Copilot code review): Zero setup on GitHub, paid, and your code goes to their service.
- Plannotator: For humans reviewing agent changes, rather than AI reviewing human changes.

## In depth
### Install and configure

```bash
npm install -g @alibaba-group/open-code-review
ocr config provider     # choose a provider and enter the API key
ocr config model        # choose the model
```

### Review

```bash
cd your-project
ocr review                               # staged, unstaged and untracked changes
ocr review --from main                   # this branch since it left main
ocr review --commit abc123               # one commit
ocr scan --path internal/agent           # audit files with no diff
ocr review --from main --format json --output review.json
```

### Inside your coding agent

```bash
npx skills add alibaba/open-code-review
```

Pick the `open-code-review-delegate` skill if you don't want a separate key. Your agent then does the review, following OCR's file selection, rules and coverage checks.

### Good to know
- Interrupted reviews of a range or commit can be resumed: `ocr session list`, then `--resume <id>`.
- The AACR-Bench dataset used for the benchmark is public on Hugging Face if you want to compare tools yourself.
