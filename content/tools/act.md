---
license: MIT
language: Go
---

## Features
- Run workflows locally: Reads `.github/workflows` and runs jobs in Docker containers on your machine.
- Choose the event: `act push`, `act pull_request`, `act workflow_dispatch`, with optional event payload files.
- Target jobs: `-j build` runs a single job; `-l` lists what would run.
- Secrets and variables: Pass them with `-s NAME=value`, `--secret-file` or `--var`.
- Runner images: Pick small, medium or large images that mimic GitHub's runners to different degrees.
- Dry runs: `-n` shows the plan without executing it.

## Strengths
- Cuts the "push, wait five minutes, fix a typo, push again" loop when writing workflows.
- Lets you debug a failing step interactively on your own machine.
- Useful for running the same CI checks locally before pushing.

## Watch out for
- It isn't identical to GitHub's hosted runners: images differ, and some actions or tools behave differently.
- Service containers, caching and some GitHub-specific features have partial support.
- Only Linux jobs run in Docker; macOS and Windows runners can't be emulated.
- Full-size runner images are very large (many gigabytes).

## Alternatives
- Push and iterate: Accurate but slow; use a scratch branch and `workflow_dispatch` to iterate.
- Dagger: Define pipelines in code so they run identically locally and in any CI.
- Earthly / Makefiles: Keep CI logic in scripts that run anywhere, and make the workflow file a thin wrapper.

## In depth
### Getting started

```bash
brew install act            # or: winget install nektos.act / scoop / gh extension install nektos/gh-act
act -l                      # list jobs and the events that trigger them
act push                    # run everything a push would run
act pull_request -j test    # one job, as a PR would run it
act -n                      # dry run
```

The first run asks which default image size to use. "Medium" is a good balance; "micro" is tiny but misses many tools.

### Secrets and inputs

```bash
act -s GITHUB_TOKEN="$(gh auth token)" --secret-file .secrets
act workflow_dispatch --input environment=staging
act -e event.json           # custom event payload
```

### Matching GitHub more closely
Map runner labels to fuller images when steps need tools that the default images lack:

```bash
act -P ubuntu-latest=catthehacker/ubuntu:act-latest
```

Put common flags in a `.actrc` file in the repo or your home directory so you don't retype them.

### Good to know
- Steps can detect act through the `ACT` environment variable, so you can skip deploy steps when running locally (`if: ${{ !env.ACT }}`).
- Keep `.secrets` out of git.
