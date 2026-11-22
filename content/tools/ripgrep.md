---
license: MIT OR Unlicense
language: Rust
---

## Features
- Smart defaults: Respects `.gitignore`, `.ignore` and `.rgignore`, and skips hidden and binary files automatically.
- Very fast: A finite-automata regex engine with SIMD acceleration, searching directories in parallel.
- File type filters: `-t ts`, `-T js` or `--type-list`, plus glob filters with `-g '!dist/**'`.
- Rich matching: Case-smart search (`-S`), whole words (`-w`), multiline (`-U`) and optional PCRE2 (`-P`) for lookarounds.
- Replacement preview: `-r` shows what a replacement would look like (it doesn't edit files).
- Machine-readable output: `--json` for tooling, and `--vimgrep` for editors.

## Strengths
- Usually the fastest way to search a codebase, and noticeably so in large monorepos.
- Ignoring node_modules, build output and git internals by default removes most of the noise.
- Clear, coloured, grouped output that's easy to scan.
- Powers search in VS Code and many other tools, so the behaviour feels familiar.

## Watch out for
- It isn't a drop-in for POSIX grep, so flags and defaults differ. Scripts written for grep may need tweaks.
- Ignore rules can hide matches you expected; add `-u`, `-uu` or `-uuu` to search ignored, hidden and binary files.
- It doesn't edit files; pair it with `sd`, `sed` or your editor for replacements.

## Alternatives
- grep: Everywhere by default and POSIX standard, but slower and noisier on code trees.
- git grep: Fast and git-aware, but only searches tracked files in a repository.
- The Silver Searcher (ag): An earlier "grep for code" tool with similar ideas, now largely superseded.
- ugrep: A grep-compatible fast search tool with an interactive TUI.

## In depth
### Why it's fast
ripgrep combines Rust's regex engine (which avoids backtracking), literal optimisations that use SIMD instructions to skip ahead quickly, memory-mapped or buffered reads chosen per file, and a parallel directory walker that applies ignore rules as it goes. Because it doesn't read files it was told to ignore, a lot of its speed on real projects comes from simply doing less work.

### Recipes you'll actually use

```bash
rg 'TODO|FIXME'                       # search everything not ignored
rg -t ts 'useEffect\('                # only TypeScript files
rg -g '!**/*.test.*' 'fetch\('        # exclude test files
rg -l 'deprecatedThing'               # list matching files only
rg -C 3 'panic!'                      # 3 lines of context
rg -S 'userid'                        # smart case: insensitive unless you type uppercase
rg -U 'async fn\s+\w+\([^)]*\)\s*->'  # multiline patterns
rg --files | rg 'config'              # find files by name
rg -uuu 'secret' .                    # search absolutely everything
```

### Good to know
- Put defaults in a config file pointed to by `RIPGREP_CONFIG_PATH`, for example `--smart-case` and your usual globs.
- `rg -r '$1' 'import (\w+)' -o` prints just the captured group, which is handy for quick extraction.
