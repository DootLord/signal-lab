---
language: JavaScript
---

## Features
- Finds the "slop": Spots the tell-tale signs of AI-generated UI, such as purple gradients, glows, emoji labels, shouty copy and uneven spacing.
- Sets a direction: Derives a design direction from your actual product rather than applying a generic theme.
- Redline-style passes: Fixes screens pass by pass, like a designer reviewing a build.
- Framework-agnostic: Works with Next.js, React, Vue, Svelte, Tailwind or plain HTML and CSS.
- Works on live sites: Can review a deployed page from a link when you don't have the code handy.
- Multiple agents: Packaged as a skill for Claude Code, Codex and Google Antigravity.

## Strengths
- Targets a very real problem: agent-built interfaces tend to look the same, and users notice.
- Encodes design judgement as a reusable skill instead of a one-off prompt.
- Works where you already are: inside your coding agent and on your existing codebase.
- Easy to install per project, so a whole team gets the same design review.

## Watch out for
- Design is subjective; review the changes as you would a junior designer's suggestions.
- Each pass spends agent tokens, so large apps cost more to "unslop".
- It's a new and fast-moving project (released October 2026), so expect its behaviour to change.

## Alternatives
- A design system (shadcn/ui, Radix, your own tokens): Prevents generic UI by constraining choices up front.
- A human design review: Still the gold standard for brand and product fit.
- Other design-focused agent skills: Several coding agents ship or support front-end design guidance you can compare it with.

## In depth
### What it does
Coding agents are good at producing working interfaces quickly, but they converge on the same look: gradient hero sections, glowing cards, emoji in headings and marketing-style copy. unslop gives your agent a structured design review. It first identifies the specific patterns that make a screen look generic, decides on a direction that suits your product, then works through the UI in passes (layout, spacing, typography, colour and copy) rather than restyling everything at once.

### Installing it in Claude Code

```bash
# for all your projects
claude plugin install unslop --marketplace heydamir/unslop

# older Claude Code versions
claude plugin marketplace add heydamir/unslop
claude plugin install unslop@heydamir
```

To limit it to one project, run the install from that project's root with `--scope local`. To share it with your team, use `--scope project` and commit `.claude/settings.json`; each teammate then adds the marketplace once in their own copy.

### Using it well
- Point it at one screen or flow at a time and review the diff before moving on.
- Give it context about your product and audience; the direction it picks depends on what it knows.
- Keep your design tokens (colours, spacing, fonts) in one place so its fixes stay consistent across pages.
