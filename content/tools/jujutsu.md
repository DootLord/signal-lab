---
license: Apache-2.0
language: Rust
---

## Features
- Git-backed: Stores everything in a normal Git repo, so remotes, GitHub and teammates' git workflows keep working.
- Working copy is a commit: There's no staging area and no stash; your edits are always saved in the current change.
- Automatic rebasing: Edit any earlier change and its descendants are rebased onto it for you.
- First-class conflicts: Conflicts are recorded in commits, so a rebase never stops halfway; resolve them when you're ready.
- Operation log: Every command is recorded, and `jj undo` or `jj op restore` takes the whole repo back.
- Revsets: A small query language for selecting changes, such as `jj log -r 'mine() & ~immutable()'`.

## Strengths
- Stacked changes and history rewriting become routine instead of risky.
- You can try it on an existing repo today, and stop using it just as easily.
- `jj undo` removes most of the fear from version control.
- Very active development, used day to day by developers at Google, where the project started.

## Watch out for
- Still 0.x: commands and config occasionally change between releases, so read the changelog when you upgrade.
- Some Git features have limited or no support, such as Git LFS, and git hooks don't run on jj commands.
- It's a different mental model (changes, not branches; bookmarks instead of branch names), so expect a learning period.
- IDE git integrations see a repo in detached-HEAD state, which can look confusing at first.

## Alternatives
- git: The universal default; interactive rebase and stash cover the same ground with more manual work.
- Sapling: Meta's Git-compatible client with a similar stacked-changes focus.
- git-branchless: Adds undo, smart log and stack-friendly commands on top of git itself.

## In depth
### How it fits with Git
`jj git init` inside an existing Git repo creates a colocated workspace: the same directory works with both `jj` and `git`, and jj reads and writes the same `.git` data. You can push to GitHub as usual, and nobody else on the team needs to change anything.

```bash
cd my-project
jj git init           # start using jj in an existing git repo
jj log                # the graph of your changes
jj new -m "Add search"  # start a new change on top of the current one
# ...edit files; there's no `add`, the change updates as you work
jj describe -m "Add search box"   # reword the current change
jj git push --change @            # push it, creating a bookmark automatically
```

### Why people switch
- **Editing old changes:** `jj edit <change>` or `jj squash --into <change>` updates an earlier commit, and everything after it is rebased automatically.
- **Splitting:** `jj split` breaks the current change into two interactively.
- **Conflicts don't block you:** a conflicted rebase still completes; `jj log` marks the conflicted changes, and you fix them when it suits you.
- **Undo:** `jj op log` lists every operation, and `jj undo` reverses the last one, including a bad rebase or push preparation.

### Good to know
- Change IDs (letters like `kxqpmrwz`) stay the same when a change is rewritten, unlike commit hashes.
- "Bookmarks" are jj's name for Git branches; you move them explicitly before pushing, or use `--change` to create one.
- The official tutorial and Steve Klabnik's community tutorial are the usual starting points.
