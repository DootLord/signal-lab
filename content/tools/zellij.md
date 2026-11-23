---
license: MIT
language: Rust
---

## Features
- Panes, tabs and sessions: Split the terminal, run several things at once, and detach while they keep running.
- Discoverable keys: A status bar shows the current mode and the keys available in it.
- Layouts as files: Describe tabs, panes and the commands they run in KDL, then commit the layout with your project.
- Floating and stacked panes: Pop a pane over your work, or stack several and expand one at a time.
- Session manager and resurrection: Switch between sessions, and restore a session's layout after a reboot.
- WebAssembly plugins: Extend it with plugins written in Rust or other languages that compile to WASM.

## Strengths
- Usable without reading a manual, unlike tmux.
- Project layouts make "open editor, dev server, logs and tests" a single command.
- Sensible defaults and a modern look out of the box.
- Actively developed, with frequent releases.

## Watch out for
- The default key bindings (Ctrl+p, Ctrl+t, Ctrl+n…) clash with shortcuts in editors and shells. Use locked mode (Ctrl+g) or pick the "unlock-first" preset.
- It's younger and less ubiquitous than tmux, so it may not be installed on servers you SSH into.
- Its scripting and plugin ecosystem is smaller than tmux's.
- Windows is not supported natively; use WSL.

## Alternatives
- tmux: The established choice: available everywhere, endlessly configurable, with a steep learning curve.
- GNU screen: Minimal and on almost every Unix box.
- Terminal emulator splits (WezTerm, Kitty, Windows Terminal): Fine locally, but sessions don't survive a dropped SSH connection.

## In depth
### Getting around
Zellij is modal. Press a key to enter a mode, then act:

- Ctrl+p: pane mode (`n` new, `d` split down, `r` split right, `x` close, `w` toggle floating)
- Ctrl+t: tab mode (`n` new, number keys to switch)
- Ctrl+o: session mode (`d` detach, `w` session manager)
- Ctrl+g: lock, which passes all keys through to the running app

### A project layout

```kdl
// dev.kdl
layout {
    tab name="code" focus=true {
        pane command="nvim"
    }
    tab name="run" {
        pane split_direction="vertical" {
            pane command="npm" { args "run" "dev"; }
            pane command="npm" { args "run" "test" "--" "--watch"; }
        }
    }
}
```

```bash
zellij --layout dev.kdl
```

### Good to know
- `zellij attach --create name` attaches to a named session, creating it if needed. It works well in SSH login scripts.
- `zellij setup --dump-config > ~/.config/zellij/config.kdl` gives you a full config to edit.
- `zellij run -- cargo test` opens a command in a new pane from your shell.
