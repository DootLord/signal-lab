---
license: MIT
language: Rust
---

## Features
- Frecency jumping: `z api` jumps to the most frequently and recently used directory matching "api".
- Multiple keywords: `z work api` narrows matches to paths containing both terms, in order.
- Interactive picker: `zi` opens an fzf list of matches when you're not sure which one you want.
- Every major shell: bash, zsh, fish, PowerShell, nushell, elvish and xonsh.
- Drop-in cd: Initialise with `--cmd cd` to make `cd` itself smart.
- Imports: Migrate your database from z, autojump or fasd.

## Strengths
- Saves keystrokes many times a day once it has learned your habits.
- Very fast: it's a compiled binary, so there's no noticeable delay on every `cd`.
- Behaves like plain `cd` for real paths, so there's nothing to unlearn.

## Watch out for
- It starts empty: it only knows directories you've visited since installing it, so it gets useful after a day or two.
- Short or ambiguous keywords can jump somewhere unexpected; add a second keyword or use `zi`.
- The interactive mode needs fzf installed.

## Alternatives
- z (rupa/z): The original frecency jumper, a shell script that's slower but dependency-free.
- autojump: A similar idea, Python-based and older.
- fzf Alt-C: Fuzzy-find any subdirectory interactively, with no learning but more typing.

## In depth
### How it works
Each time you change directory, zoxide adds the path to a small database and bumps its score. Scores combine frequency with recency, and old entries decay over time, so the ranking follows what you're working on now. When you run `z foo`, it picks the highest-scoring path whose last component matches "foo" (or whose path contains all your keywords in order).

### Setup

```bash
# install via your package manager, e.g.
brew install zoxide        # or: apt install zoxide / winget install ajeetdsouza.zoxide

# bash
echo 'eval "$(zoxide init bash)"' >> ~/.bashrc
# zsh
echo 'eval "$(zoxide init zsh)"' >> ~/.zshrc
# fish
echo 'zoxide init fish | source' >> ~/.config/fish/config.fish
# PowerShell
Add-Content $PROFILE 'Invoke-Expression (& { (zoxide init powershell | Out-String) })'
```

### Everyday use

```bash
z signal          # jump to ~/Repos/signal-lab
z repos sig       # disambiguate with more keywords
zi                # pick interactively
z -               # back to the previous directory
zoxide query -ls  # see what it has learned, with scores
```

### Good to know
- Use `zoxide init bash --cmd cd` if you'd rather keep typing `cd` and have it become smart.
- `zoxide remove <path>` forgets a directory you no longer want suggested.
