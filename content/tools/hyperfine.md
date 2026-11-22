---
license: MIT OR Apache-2.0
language: Rust
---

## Features
- Statistical runs: Runs a command many times and reports mean, standard deviation, min, max and outliers.
- Warmup and preparation: `--warmup` runs to fill caches, and `--prepare` runs a setup command before each timing (for example clearing a build cache).
- Side-by-side comparison: Benchmark several commands at once and get a "X is 2.3× faster than Y" summary.
- Parameter scans: `-P threads 1 8` or `-L compiler gcc,clang` runs a matrix of variants.
- Exports: Markdown, JSON, CSV and AsciiDoc output, ready for PR descriptions or charts.
- Shell overhead correction: Measures and subtracts shell start-up time, or skips the shell entirely with `-N`.

## Strengths
- Gives you numbers you can trust, with variance, instead of one noisy `time` result.
- Perfect for settling "is the new version actually faster?" debates in a pull request.
- Easy to use on any command, in any language, with no code changes.

## Watch out for
- It measures whole-process wall-clock time, not individual functions; use an in-language benchmark library for micro-benchmarks.
- Background load (browsers, indexing, CPU throttling on laptops) adds noise, so close things or use a quiet machine.
- For very fast commands, use `-N` and more runs, or the noise dominates.

## Alternatives
- time: Built into every shell, but a single sample with no statistics.
- In-code benchmark libraries (Vitest bench, criterion, BenchmarkDotNet): Better for measuring functions rather than whole commands.
- poop: A Linux-only tool that adds hardware counters like cache misses and instructions.

## In depth
### Example: compare two builds and publish the result

```bash
hyperfine --warmup 2 --runs 10 \
  --prepare 'rm -rf dist' \
  'npm run build' 'bun run build' \
  --export-markdown bench.md
```

The output shows each command's mean ± σ, the range, and a relative summary. `bench.md` contains a table you can paste into a PR.

### Parameter scans

```bash
# How does a build scale with parallel jobs?
hyperfine --prepare 'make clean' -P threads 1 8 'make -j {threads}'

# Compare named variants
hyperfine -L tool rg,grep '{tool} -r "TODO" .'
```

### Getting reliable numbers
- Use `--warmup` for anything that touches disk caches, and `--prepare` to reset state when you want cold-cache numbers.
- Watch the "outliers" warning; it usually means something else was competing for the CPU.
- Export JSON (`--export-json`) to keep historical results or plot them.
