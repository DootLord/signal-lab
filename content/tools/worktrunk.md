---
license: MIT OR Apache-2.0
language: Rust
---

## Features
- Worktrees by branch name: `wt switch feat` creates or jumps to a branch's worktree; paths come from a configurable template.
- Start an agent in one step: `wt switch -c -x claude feat` creates the branch and worktree, then runs the command inside it.
- Status at a glance: `wt list` shows every worktree's changes, commits ahead and behind, and unpushed work; `--full` adds CI status and AI summaries.
- Merge and clean up: One command squashes, rebases or merges a branch and removes its worktree.
- Hooks: Run commands on create, before and after merge, and at other points, such as installing dependencies or starting a dev server.
- Shared build caches: Copy `node_modules/`, `target/` and similar folders into new worktrees using copy-on-write, on APFS, btrfs and XFS.

## Strengths
- Turns git's clunky worktree commands into something as quick as switching branches.
- Built for the parallel-agents workflow, with plugins for Claude Code, Codex, OpenCode and Gemini CLI.
- Useful without AI too, for reviewing a PR (`wt switch pr:123`) while keeping your own work untouched.
- Actively maintained with frequent releases and thorough documentation.

## Watch out for
- Still 0.x and moving quickly, so options and output can change between releases.
- Each worktree is a full checkout: without the copy-on-write cache, dependencies and builds are repeated per worktree.
- On Windows, `wt` clashes with Windows Terminal's command; winget installs it as `git-wt` instead.
- Shell integration (`wt config shell install`) is needed for `wt switch` to change your directory.

## Alternatives
- Plain git worktree: Built in, but you type the branch name several times and clean up by hand.
- Separate clones: Simple and fully isolated, but slow to create and easy to lose track of.
- Desktop apps for parallel agents: Wrap worktrees in a GUI, at the cost of leaving your terminal workflow.

## In depth
### Why worktrees for agents
Agents such as Claude Code and Codex can work unsupervised for long stretches, so running several at once is practical. If they share one checkout they overwrite each other's files. Git worktrees give each branch its own directory backed by the same repository, but the raw commands are tedious:

```bash
git worktree add -b feat ../repo.feat && cd ../repo.feat && claude
# later
cd ../repo && git worktree remove ../repo.feat && git branch -d feat
```

With Worktrunk the same steps are:

```bash
wt switch -c -x claude feat
wt remove
```

### A typical workflow

```bash
brew install worktrunk && wt config shell install
wt switch -c -x claude auth-refactor -- 'Refactor the session handling'
wt switch -c -x codex fix-flaky-tests
wt list                      # see what each agent has changed
wt switch auth-refactor      # jump in to review
wt merge                     # squash, rebase onto main and clean up
```

### Good to know
- Use the `hash_port` template filter in hooks to give each worktree's dev server its own port.
- `wt step copy-ignored` shares build caches between worktrees on copy-on-write filesystems.
- Also available through Cargo, Arch, conda-forge and PyPI (`uv tool install worktrunk`).
