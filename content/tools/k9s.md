---
license: Apache-2.0
language: Go
---

## Features
- Live views: Pods, deployments, services, nodes and any custom resource, updating in real time.
- Logs: Stream, filter and follow container logs across pods without long kubectl commands.
- Quick actions: Shell into containers, port-forward, describe, edit YAML, scale, restart and delete, each with a keystroke.
- Context and namespace switching: Jump between clusters and namespaces with `:ctx` and `:ns`.
- Pulse and XRay views: Cluster health at a glance, and a tree of how resources relate.
- Customisable: Plugins, hotkeys, aliases, skins and a read-only mode.

## Strengths
- Debugging a misbehaving workload takes seconds instead of a string of kubectl commands.
- Command-style navigation (`:pods`, `:deploy`, `/filter`) feels natural for terminal users.
- Works anywhere your kubeconfig does, including over SSH.
- Read-only mode makes it safe to hand to people who should look but not touch.

## Watch out for
- Destructive actions are a keystroke away; use `--readonly` on production contexts, or confirm prompts carefully.
- It takes a little while to learn the keybindings (`?` shows them).
- It's a terminal UI, so it's less suited to sharing views with non-terminal teammates.

## Alternatives
- kubectl: The source of truth and fully scriptable, but slow for interactive debugging.
- Lens / Freelens: Desktop GUI apps with graphs and multi-cluster management.
- Headlamp: An open-source web and desktop Kubernetes UI.
- Kubernetes Dashboard: The official web UI, usually deployed in-cluster.

## In depth
### Getting around

```bash
brew install derailed/k9s/k9s   # or scoop/winget/apt, or download a release
k9s                             # current kubeconfig context
k9s --context prod --readonly   # look, don't touch
k9s -n payments                 # start in a namespace
```

Inside k9s:
- `:pods`, `:deploy`, `:svc`, `:ing`, `:events`, or any resource name or short name, switches view.
- `/text` filters the current list; `Esc` clears it.
- `Enter` drills down (deployment → pods → containers).
- `l` shows logs, `s` opens a shell, `Shift-f` sets up a port-forward, `d` describes, `e` edits.
- `Ctrl-d` deletes and `Ctrl-k` kills (with confirmation), so be careful.
- `:ctx` switches cluster, `:ns` switches namespace, `?` shows help.

### A typical debugging session
A deployment is crash-looping: `:deploy`, filter with `/api`, press Enter to see its pods, select the failing pod, `l` for logs (toggle previous container logs to see the crash), `d` to read events at the bottom of the describe output, then `Shift-f` to port-forward and poke the service locally.

### Good to know
- Configuration lives under the k9s config directory (`k9s info` prints the paths); that's where skins, aliases and plugins go.
- Plugins let you bind custom commands, such as opening a debug container or running a script against the selected pod.
