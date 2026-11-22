---
license: MIT OR Apache-2.0
language: Rust
---

## Features
- Simple syntax: `fd config` finds paths containing "config"; no `-name` or `-iname` incantations.
- Smart defaults: Skips hidden files and anything in `.gitignore`; case-insensitive unless your pattern has capitals.
- Regex or glob: Regular expressions by default, and `--glob` when you'd rather use shell-style patterns.
- Filters: By extension (`-e ts`), type (`-t f`, `-t d`), size, modification time (`--changed-within 2d`) and depth.
- Run commands: `-x` runs a command per result in parallel; `-X` runs it once with all results.
- Fast: A parallel directory walk, with coloured output by file type.

## Strengths
- Covers 90% of what people use `find` for, with commands you can remember.
- Much faster on large trees, especially when ignore rules prune node_modules and build folders.
- Pairs naturally with fzf, ripgrep and xargs-style workflows.

## Watch out for
- It isn't a find replacement for scripts, since it has different semantics and fewer predicates (complex permission tests, for example).
- On Debian and Ubuntu the binary is called `fdfind` because of a name clash; alias it to `fd`.
- Hidden and ignored files are skipped by default; use `-H` and `-I` when you need them.

## Alternatives
- find: Universal and scriptable with powerful predicates, but verbose and slower.
- rg --files: Lists files ripgrep would search; combine with a filter for quick name searches.
- fzf: Interactive fuzzy finding over file lists, and often fed by fd.

## In depth
### Everyday examples

```bash
fd                               # list all non-ignored files under here
fd -e md                         # all Markdown files
fd -t d node_modules -HI         # find every node_modules dir (include ignored)
fd '^\.env' -H                   # dotenv files (hidden)
fd -e ts --changed-within 1d     # TypeScript files changed in the last day
fd -g '*.test.ts' src            # glob pattern in src/
fd -e png -x convert {} {.}.webp # convert each PNG to WebP in parallel
fd -e log -X rm                  # delete all log files in one rm call
```

The placeholders in `-x` commands are handy: `{}` is the full path, `{.}` drops the extension, `{/}` is the file name and `{//}` is the parent directory.

### With fzf
Set fd as fzf's file source to get fast, gitignore-aware fuzzy finding:

```bash
export FZF_DEFAULT_COMMAND='fd --type f --hidden --exclude .git'
```

### Good to know
- On Debian/Ubuntu: `sudo apt install fd-find` then `ln -s $(which fdfind) ~/.local/bin/fd`.
- Use `--exclude` (or `-E`) for one-off ignores without editing `.gitignore`.
