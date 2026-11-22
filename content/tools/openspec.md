---
license: MIT
language: TypeScript
---

## Features
- Living specs: `openspec/specs/` holds current requirements as plain Markdown with concrete scenarios.
- Change folders: Each change gets a proposal, spec deltas, a design and a task list under `openspec/changes/`.
- Assistant skills: `/openspec-explore`, `/openspec-propose`, `/openspec-apply-change` and `/openspec-archive-change` drive the workflow.
- Wide tool support: Works with more than 30 AI coding assistants, including Claude Code, Codex and Cursor.
- Archive on completion: Finished changes are merged into the specs and archived with a date.
- Stores (beta): Keep planning in a separate repo, shared across teams and code repos.

## Strengths
- Lighter than other spec-driven tools: no rigid phase gates, and you can update any document at any time.
- Designed for existing codebases, not just new projects.
- Works with the assistants you already use rather than tying you to one IDE.
- Plain Markdown specs are easy to review in a pull request.

## Watch out for
- Adds process: for small fixes, a direct prompt is often quicker.
- The results depend on actually reading and correcting the proposal before the agent writes code.
- Version 2.0 renamed the 1.x `/opsx:*` commands, so older guides and blog posts may be out of date.

## Alternatives
- GitHub Spec Kit: A more thorough, heavier spec-driven workflow with stricter phases.
- Kiro: AWS's agentic IDE with specs built in, but tied to that IDE.
- Your agent's plan mode: Built in and quick, but the plan isn't kept in the repo afterwards.

## In depth
### The loop
1. **Explore** (optional): `/openspec-explore` reads your code and talks through options without changing anything.
2. **Propose**: `/openspec-propose add-dark-mode` creates `openspec/changes/add-dark-mode/` with `proposal.md`, spec changes, `design.md` and `tasks.md`.
3. **Review**: You read and edit those files. This is the step that matters.
4. **Apply**: `/openspec-apply-change` works through the tasks.
5. **Archive**: `/openspec-archive-change` merges the spec changes into `openspec/specs/` and archives the change folder.

### What a spec looks like

```markdown
## ADDED Requirements
### Requirement: Theme selection
The app SHALL let users switch between light and dark themes,
defaulting to the system preference.

#### Scenario: User toggles dark mode
- **WHEN** the user clicks the theme toggle
- **THEN** the app switches to dark mode and persists the choice
```

### Getting started

```bash
npm install -g @fission-ai/openspec@latest   # needs a recent Node.js; or: brew install openspec
cd your-project
openspec init                                # choose which assistants to set up
```

After upgrading the CLI, run `openspec update` in each project that commits its skills, so they match the new version.

### Good to know
- `openspec config profile` switches on the expanded workflow, with commands for continuing, fast-forwarding and verifying changes.
- The OpenSpec repo is built with OpenSpec, so its own `openspec/` folder is a good real-world example.
- In the November 2026 Thoughtworks Technology Radar it moved to Trial.
