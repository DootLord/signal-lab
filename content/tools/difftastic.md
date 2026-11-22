---
license: MIT
language: Rust
---

## Features
- Syntax-aware diffs: Parses code with tree-sitter and diffs the syntax trees, not the lines.
- Ignores layout changes: Reformatting, re-wrapping and re-indenting don't show up as changes.
- Side-by-side output: Highlights the exact tokens that changed in each version.
- Many languages: Supports dozens of languages and formats, and falls back to a line diff for the rest.
- Git and jj integration: Works as git's external diff or difftool, and with Jujutsu and Mercurial.

## Strengths
- Makes reviews of refactors and formatter changes far easier to read.
- Shows what actually moved when code is wrapped in a new block or function call.
- Trying it takes one command, with no change to your repo.

## Watch out for
- Output is for people to read: it can't produce patches for `git apply`.
- Very large files or diffs can be slow, and it falls back to a plain diff past configurable limits.
- It only changes your terminal; GitHub and GUI review tools still show line diffs.

## Alternatives
- delta: A nicer pager for ordinary line diffs, with syntax highlighting and side-by-side mode, but not structural.
- git diff --word-diff: Built in and quick, but still text-based.
- IDE diff viewers: Good inline highlighting, but tied to your editor.

## In depth
### Trying it with git

```bash
git -c diff.external=difft diff                 # one-off, working tree
git -c diff.external=difft log -p --ext-diff    # history
git -c diff.external=difft show --ext-diff HEAD
```

`git diff` uses `diff.external` automatically; `log`, `show` and similar commands need `--ext-diff`.

### Making it permanent
Aliases keep git's normal diff available for patches while giving you difftastic on demand:

```bash
git config --global alias.dft "-c diff.external=difft diff"
git config --global alias.dlog "-c diff.external=difft log -p --ext-diff"
```

Or set it as a difftool:

```bash
git config --global diff.tool difftastic
git config --global difftool.difftastic.cmd 'difft "$LOCAL" "$REMOTE"'
git config --global difftool.prompt false
git difftool HEAD~1
```

### Good to know
- `difft --display inline` gives a single-column view for narrow terminals.
- `difft old.json new.json` works on any two files, outside git too.
- It's maintained by Wilfred Hughes, and the manual at difftastic.wilfred.me.uk covers configuration in detail.
