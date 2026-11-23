---
license: MIT
language: Rust
---

## Features
- Syntax highlighting: Diffs are coloured using the language of each file.
- Word-level changes: Highlights exactly which part of a line changed, not just the whole line.
- Side-by-side view: Optional two-column layout with line numbers.
- Navigation: With `navigate = true`, press `n` and `N` to jump between files in a long diff.
- Works with git blame, grep and ripgrep: Formats more than just diffs.
- Merge conflicts: Renders conflict markers in a readable way.

## Strengths
- One config change improves `git diff`, `git show`, `git log -p`, `git add -p` and `git blame` together.
- Works inside lazygit and other tools that accept a custom pager.
- Highly configurable themes, and it can match your bat theme.
- Mature and actively maintained.

## Watch out for
- Side-by-side needs a wide terminal; it wraps awkwardly in narrow windows.
- `git add -p` needs the separate `interactive.diffFilter` setting.
- Copying from the terminal picks up line numbers and decorations; turn them off or use `git diff --no-pager`.

## Alternatives
- difftastic: Compares code by syntax tree, so it ignores formatting-only changes. You can use both.
- diff-so-fancy: An older, simpler prettifier for git diffs.
- A GUI or editor diff view: Better for very large reviews.

## In depth
### Recommended git config

```ini
[core]
    pager = delta
[interactive]
    diffFilter = delta --color-only
[delta]
    navigate = true
    line-numbers = true
    side-by-side = true
[merge]
    conflictStyle = zdiff3
```

### Commands that get better

```bash
git diff
git show HEAD~1
git log -p -- src/auth.ts
git blame src/auth.ts
rg --json 'TODO' | delta
```

### Good to know
- `delta --show-themes` previews the built-in themes against a real diff.
- Light terminal? Set `light = true`, or let delta detect your terminal's background.
- The crate and Homebrew formula are called `git-delta`, but the binary is `delta`.
