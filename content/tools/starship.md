---
license: ISC
language: Rust
---

## Features
- Context-aware modules: Shows the git branch and status, language and tool versions, the cloud or Kubernetes context, and battery, but only when they're relevant to the current directory.
- Any shell: bash, zsh, fish, PowerShell, Nushell, Elvish, Ion, Xonsh, cmd (via Clink) and more.
- One TOML config: `~/.config/starship.toml`, shared across shells and machines.
- Presets: Ready-made styles, including plain-text versions that don't need special fonts.
- Command duration and status: Shows how long the last command took and whether it failed.
- Diagnostics: `starship explain` and `starship timings` show what each module is doing.

## Strengths
- Fast: written in Rust, and modules that run commands have timeouts.
- The same prompt everywhere, which helps if you move between macOS, Linux and Windows.
- Sensible defaults; most people only tweak a few lines.
- Very widely used, so there are plenty of shared configs to copy.

## Watch out for
- The default icons need a Nerd Font in your terminal; otherwise use a plain-text preset.
- Enabling many modules in a huge repo can add noticeable delay; check with `starship timings`.
- It's only a prompt. Plugins, completions and aliases still come from your shell or a framework.

## Alternatives
- Powerlevel10k: Very fast and featureful, but zsh only and in maintenance mode.
- Oh My Posh: A similar cross-shell prompt, popular with PowerShell users.
- Oh My Zsh themes: Built in if you already use the framework, but slower and zsh only.

## In depth
### Install and enable

```bash
curl -sS https://starship.rs/install.sh | sh

# bash (~/.bashrc)
eval "$(starship init bash)"
# zsh (~/.zshrc)
eval "$(starship init zsh)"
# fish (~/.config/fish/config.fish)
starship init fish | source
# PowerShell ($PROFILE)
Invoke-Expression (&starship init powershell)
```

### A small config

```toml
# ~/.config/starship.toml
add_newline = false
command_timeout = 500

[directory]
truncation_length = 3

[git_status]
disabled = false

[nodejs]
format = "via [node $version](green) "

[kubernetes]
disabled = false
```

### Good to know
- `starship preset --list` shows the bundled presets; `starship preset <name> -o ~/.config/starship.toml` applies one.
- Point `STARSHIP_CONFIG` at a file in your dotfiles repo to share one config.
- Custom modules can show the output of any command, such as the current AWS profile or a project's version.
