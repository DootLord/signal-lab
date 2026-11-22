---
license: Apache-2.0
language: Rust
---

## Features
- Snapshot and refs: `snapshot` returns the page as compact accessibility-tree text with a ref like `@e1` for each element.
- Shell-friendly commands: `open`, `click`, `fill`, `press`, `wait`, `get` and more, each a short command an agent can run.
- Persistent browser: A background daemon keeps the browser open between commands, with named sessions and saved state.
- Debugging tools: Console and error logs, network inspection, screenshots, PDFs, traces, performance profiles and Web Vitals.
- Many engines: Chrome for Testing by default, an existing Chrome over CDP, Lightpanda, the iOS Simulator, or cloud browser providers.
- Agent integrations: Built-in skills (`agent-browser skills get core`) and an MCP server (`agent-browser mcp`).

## Strengths
- Text snapshots are much cheaper for a model to read than screenshots or raw HTML.
- Works in any agent that can run shell commands, with no MCP setup required.
- Clicks fail loudly when the target is hidden or covered, instead of silently doing nothing.
- Native binaries for macOS, Linux and Windows, maintained by Vercel Labs.

## Watch out for
- It's young and changes quickly; check the changelog when you upgrade.
- Refs belong to one snapshot, so the agent must take a new snapshot after navigation or DOM changes.
- A logged-in browser controlled by an agent is a security risk; use its domain allowlists and action policies.
- For a regression test suite, a test framework such as Playwright is still the better fit.

## Alternatives
- Playwright MCP: Microsoft's MCP server for Playwright, a natural choice in MCP-first setups.
- Chrome DevTools MCP: Google's MCP server focused on debugging and performance in Chrome.
- Browser Use: A Python framework for building browser agents.
- Playwright: The standard for scripted end-to-end tests that humans write and maintain.

## In depth
### The core loop

```bash
npm install -g agent-browser
agent-browser install            # download Chrome for Testing (first time only)
agent-browser open localhost:3000
agent-browser snapshot -i        # interactive elements only, each with a ref
agent-browser fill @e2 "demo@example.com"
agent-browser click @e5
agent-browser get url            # check where the click led
agent-browser close
```

A snapshot looks like:

```text
- textbox "Email" [ref=e2]
- button "Sign in" [ref=e5]
```

The agent reads this, acts on a ref, takes a new snapshot to confirm the result, and repeats. CSS selectors, text, XPath and role-based locators (`find role button click --name "Submit"`) also work.

### Teaching your agent to use it

```bash
npx skills add vercel-labs/agent-browser
```

Or add two lines to `AGENTS.md`:

```markdown
Use `agent-browser` for browser automation. Before the first use, run
`agent-browser skills get core` and follow it.
```

The skill always loads instructions from the installed CLI, so it stays in step with your version.

### Good to know
- On Linux, `agent-browser install --with-deps` also installs the browser's system libraries.
- `npx agent-browser open example.com` tries it without a global install.
- Each `--session` gets its own daemon and browser, which helps when several agents run at once.
