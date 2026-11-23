---
license: MIT
language: Go
---

## Features
- Fuzzy matching: Type a few loose characters (`srvcfg`) to match `src/server/config.ts`; results are ranked as you type.
- Shell key bindings: Ctrl+R searches history, Ctrl+T pastes a file path, Alt+C changes into a directory.
- Fuzzy completion: Type `**` then Tab after commands such as `vim`, `cd`, `ssh` or `kill` to pick an argument.
- Preview window: `--preview` shows a file, a diff or command output for the highlighted line.
- Works on any list: Anything that prints lines (git branches, Docker containers, processes) can be piped into it.
- Fast and dependency-free: A single Go binary that handles millions of lines without lag.

## Strengths
- The history search alone saves time every day, and it takes one line of shell config.
- Composable in the Unix way, so it turns any script into an interactive picker.
- Works in bash, zsh, fish, PowerShell (via PSFzf), and inside Vim/Neovim and tmux.
- Mature, stable and still actively developed, with frequent releases.

## Watch out for
- Out of the box you only get the bare finder; the key bindings need the shell integration line.
- Advanced use (custom bindings, `--bind` actions, reload) has a lot of options and takes time to learn.
- The default file walker ignores hidden files; set `FZF_DEFAULT_COMMAND` (for example to `fd`) to change what it lists.

## Alternatives
- Atuin: Better for shell history specifically, with context and sync, but it isn't a general picker.
- skim: A Rust clone of fzf with a similar interface.
- Telescope or fzf-lua: Fuzzy finders inside Neovim; fzf-lua uses fzf itself.
- zoxide: Covers the "jump to a directory" case with frecency, and pairs well with fzf.

## In depth
### Set it up once

```bash
# bash
eval "$(fzf --bash)"
# zsh
source <(fzf --zsh)
# fish
fzf --fish | source
```

Use fd for the file list so `.gitignore` is respected:

```bash
export FZF_DEFAULT_COMMAND='fd --type f --hidden --exclude .git'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
```

### Small recipes

```bash
# Open a file with a highlighted preview
vim "$(fzf --preview 'bat --color=always {}')"

# Switch git branch
git branch --format='%(refname:short)' | fzf | xargs git switch

# Kill a process
ps -ef | fzf | awk '{print $2}' | xargs kill

# Pick a running container and open a shell in it
docker exec -it "$(docker ps --format '{{.Names}}' | fzf)" sh
```

### Good to know
- `fzf --tmux` opens the finder in a tmux popup.
- `--multi` (Tab to mark) lets you select several lines at once.
- The online docs have a getting-started guide and a long list of community examples.
