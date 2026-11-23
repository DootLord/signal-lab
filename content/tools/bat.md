---
license: MIT OR Apache-2.0
language: Rust
---

## Features
- Syntax highlighting: Covers hundreds of languages and file types, using Sublime Text syntax definitions.
- Git markers: The margin shows lines added, changed or removed since the last commit.
- Automatic paging: Long files open in `less`; short ones print directly.
- Plain when piped: When output isn't a terminal it behaves like `cat`, so scripts aren't affected.
- Show non-printables: `bat -A` reveals tabs, trailing spaces and line endings.
- Themes: Ships with many colour themes and accepts custom `.tmTheme` files.

## Strengths
- A drop-in improvement you can alias over `cat` without breaking anything.
- Makes a good previewer for fzf, man pages, `git show` and `--help` output.
- Fast, a single binary, and available in every major package manager.
- From the author of fd and hyperfine, with the same polish.

## Watch out for
- On Debian and Ubuntu the binary is called `batcat` because of a name clash; add an alias.
- Paging can surprise you in scripts run from a terminal; use `-p` or `--paging=never`.
- Highlighting very large files is slower than plain `cat`.

## Alternatives
- cat with less: Always available, but no colour.
- delta: Better for diffs specifically; bat is for whole files.
- Your editor's read-only mode: Fine if you already live in Vim or Neovim.

## In depth
### Setup

```bash
# Debian/Ubuntu
alias bat=batcat
# Optional: replace cat interactively
alias cat='bat --paging=never'
```

### Useful combinations

```bash
# Highlighted previews in fzf
fzf --preview 'bat --color=always --style=numbers {}'

# Coloured man pages
export MANPAGER="sh -c 'col -bx | bat -l man -p'"

# Highlight --help output
cargo --help | bat -l help -p

# Show a specific range of lines
bat -r 40:80 src/main.rs
```

### Good to know
- `bat --list-languages` and `bat --list-themes` show what's available; set your default with `BAT_THEME`.
- Map unusual file names to a syntax with `--map-syntax`, for example `'*.conf:INI'`.
- After adding custom themes or syntaxes, run `bat cache --build`.
