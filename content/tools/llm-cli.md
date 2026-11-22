---
license: Apache-2.0
language: Python
---

## Features
- Prompt from the terminal: `llm "question"`, or pipe anything in: `cat error.log | llm "what went wrong?"`.
- Any model via plugins: OpenAI built in; plugins add Anthropic, Gemini, Mistral, local models through Ollama or llama.cpp, and more.
- Everything logged: Every prompt and response goes to a local SQLite database you can search (`llm logs`) or explore with Datasette.
- System prompts and templates: `-s` sets a system prompt; save reusable prompts as templates.
- Conversations: `-c` continues the last conversation, or pick one by ID.
- Beyond chat: Embeddings and similarity search, attachments for images and audio, and tool calling.

## Strengths
- Fits Unix workflows: combine with git, grep, jq and pipes instead of copy-pasting into a browser.
- Provider-agnostic: switch models with `-m` without changing your scripts.
- The SQLite log is a searchable record of every prompt you've run, and what it cost.
- Written and maintained by Simon Willison, with excellent documentation and frequent updates.

## Watch out for
- You pay for API usage with each provider (or run local models instead).
- Plugin quality and model support vary; check the plugin directory for your provider.
- Sending logs or code to hosted models has privacy implications; use local models for sensitive data.

## Alternatives
- aichat: An all-in-one LLM CLI written in Rust, with a REPL and roles.
- mods (Charm): A pipe-friendly LLM CLI with nice formatting.
- Ollama CLI: Great for local models only.
- Coding agents (Claude Code, Codex CLI, Aider): For editing code rather than one-off prompts.

## In depth
### Setup

```bash
uv tool install llm            # or: pipx install llm / brew install llm
llm keys set openai            # paste your API key
llm install llm-anthropic      # add more providers via plugins
llm models                     # list available models
```

### Everyday uses

```bash
git diff --staged | llm -s "Write a conventional commit message for this diff"
cat app.log | tail -200 | llm "Summarise the errors and likely cause"
llm -m <model-id> "Explain this regex: ^(?=.*\d)(?=.*[a-z]).{8,}$"
curl -s https://example.com/api | llm -s "Describe this JSON's structure as a TypeScript type"
llm -c "Now make it shorter"   # continue the previous conversation
```

### Templates and logs

```bash
llm -s "You are a senior reviewer. Point out bugs only." --save review
git diff | llm -t review

llm logs -n 5          # last five interactions
llm logs -q "regex"    # search past prompts and answers
```

### Good to know
- Set a default model with `llm models default <model-id>` so day-to-day commands stay short.
- The log database's location is printed by `llm logs path`; open it with Datasette for a browsable history.
