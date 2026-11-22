---
license: MIT
language: Go
---

## Features
- Line-level staging: Stage individual lines or hunks with a keypress, so commits contain exactly what you intend.
- Interactive rebase made easy: Squash, fixup, reword, reorder and drop commits from a list.
- Amend any commit: Fold staged changes into an older commit, not just the latest.
- Cherry-pick by copy and paste: Copy commits from one branch and paste them onto another.
- Undo: `z` undoes the last action using the reflog, which makes experimenting safe.
- Everything else: Branches, worktrees, stashes, remotes, merge conflict resolution and custom commands.

## Strengths
- Makes history-editing operations, which most people avoid, quick and approachable.
- Very fast keyboard-driven workflow without leaving the terminal.
- Shows exactly what git is doing, so it's also a good way to learn git.
- Works over SSH and in any terminal.

## Watch out for
- There are a lot of keybindings to learn; press `?` in any panel to see them.
- Very large repositories can make the initial load slower.
- Rewriting shared history is still dangerous; the tool makes it easy, not safe.

## Alternatives
- git CLI: Always available and scriptable, but interactive rebase and partial staging are fiddly.
- tig: A text-mode interface focused on browsing history.
- gitui: Another fast terminal UI, written in Rust.
- GUI clients (Fork, GitKraken, Sublime Merge): Mouse-friendly desktop apps.

## In depth
### Workflows it makes painless
- **Clean up before a PR:** open the commits panel, press `s` to squash, `f` to fixup, `r` to reword, or move commits with `Ctrl-j`/`Ctrl-k`. No editor-based rebase todo file.
- **Split a messy change:** in the files panel, press Enter on a file, select individual lines with space, and commit them separately.
- **Fix an old commit:** stage the fix, select the commit, press `A` to amend it, and lazygit rebases the rest for you.
- **Move commits between branches:** `c` to copy commits, switch branch, `v` to paste.
- **Oops:** `z` undoes; `Ctrl-z` redoes.

### Getting started

```bash
brew install lazygit     # or scoop/winget/apt; see the README for your OS
cd your-repo
lazygit
```

Panels are numbered (1 status, 2 files, 3 branches, 4 commits, 5 stash). Tab or the number keys switch between them, and `?` shows context-sensitive help.

### Good to know
- Custom commands in `config.yml` let you bind your own git or shell commands to keys.
- Add `alias lg=lazygit` to your shell config; most users end up opening it constantly.
