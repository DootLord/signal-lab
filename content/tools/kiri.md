---
language: Rust
---

## Features
- Docker Desktop replacement: Runs your existing Docker images with a lightweight runtime written in Rust.
- Works with your tools: Compatible with the docker CLI, Docker Compose and buildx through a dedicated Docker context.
- Cross-platform: macOS 14+ (Apple silicon and Intel), Windows 10 and 11 through WSL 2, and Linux (.deb and .rpm packages).
- Self-updating: Checks each new release's signature before updating itself.
- Simple install: Homebrew cask on macOS, or native installers from the releases page.

## Strengths
- Aims at the most common Docker Desktop complaints: slow start-up and heavy resource use when idle.
- No workflow change: the same `docker` and `docker compose` commands, just a different context.
- Easy to try side by side with your current setup, and easy to switch back.

## Watch out for
- It's very new (first released in November 2026), so expect rough edges and compatibility gaps.
- Unproven for large or unusual Compose setups, GPU workloads, or Kubernetes-in-Docker tooling.
- Check its licensing and security documentation before rolling it out to a team.

## Alternatives
- Docker Desktop: The reference experience, with GUI, extensions and Kubernetes, but heavier and licensed for larger companies.
- OrbStack: A fast, polished Docker and Linux VM app for macOS (commercial).
- Colima: An open-source, minimal container runtime for macOS and Linux using Lima VMs.
- Podman Desktop: A daemonless, rootless-friendly container engine with a desktop app.
- Rancher Desktop: Open source, with containerd or Moby plus built-in Kubernetes.

## In depth
### How it fits in
Docker's CLI can talk to more than one engine through "contexts". Kiri sets up a `kiri` context the first time it starts, so you can choose per command, or switch your default, without uninstalling anything:

```bash
docker --context kiri run --rm alpine echo hello   # one-off
docker context use kiri                            # make it the default
docker compose up -d                               # now runs on Kiri
docker context use default                         # switch back
```

### Evaluating it safely
Because it's new, treat adoption as a trial:

1. Install it alongside your current runtime and run your project's `docker compose up` against the `kiri` context.
2. Compare start-up time, idle memory and build times with what you use today.
3. Check the things that usually break first: bind-mount performance and file watching, networking between containers, multi-platform builds with buildx, and anything that relies on a VM feature.
4. Keep your existing runtime installed until you've used Kiri for real work for a while.

### Good to know
- The project's README also mentions a built-in way to expose local services publicly (an ngrok-style feature). Review its security implications before using it.
- Watch the releases page; early-stage tools change quickly.
