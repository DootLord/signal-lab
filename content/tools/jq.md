---
license: MIT
language: C
---

## Features
- Path access: `.items[0].name` pulls a value out of nested JSON.
- Filters and pipes: Chain steps with `|`, such as `.[] | select(.active) | .email`.
- Reshaping: Build new objects and arrays, rename keys, group, sort, and merge documents.
- Raw output: `-r` prints strings without quotes, ready for other shell commands.
- Variables from the shell: `--arg` and `--argjson` pass values in safely, with no string splicing.
- Format conversion: `@csv`, `@tsv`, `@base64` and `@uri` turn JSON into other formats.

## Strengths
- A single small binary that is already installed on most CI images and servers.
- Its syntax has become a standard: yq, gojq, jaq and many cloud CLIs use the same filters.
- Handles streaming and large files, and `--slurp` reads several documents at once.
- Decades of Stack Overflow answers cover almost any transformation you need.

## Watch out for
- The filter language is powerful but terse; anything beyond simple paths takes practice.
- Forgetting `-r` leaves quotes around strings, which breaks shell variables and loops.
- Error messages for bad filters are not very helpful.
- It's JSON only; use yq for YAML or TOML.

## Alternatives
- yq: jq-style filters for YAML, JSON, XML and TOML.
- jaq or gojq: Faster or stricter reimplementations of the jq language.
- fx or jless: Interactive viewers for exploring a large JSON document.
- A short Python or Node script: Clearer once the logic needs loops and conditions.

## In depth
### Everyday filters

```bash
# One field
jq -r '.version' package.json

# Fields from every item in an array
curl -s https://api.github.com/repos/jqlang/jq/releases | jq -r '.[].tag_name'

# Filter and reshape
jq '[.[] | select(.stars > 1000) | {name, stars}]' repos.json

# Count by a key
jq 'group_by(.status) | map({status: .[0].status, count: length})' jobs.json

# JSON to CSV
jq -r '.[] | [.id, .name, .email] | @csv' users.json
```

### Passing shell values in safely

```bash
jq --arg env "$ENV" '.deploy.target = $env' config.json > config.new.json
```

### Good to know
- `jq -c` prints one compact JSON object per line, which works well with `while read` loops.
- `jq -e` sets the exit code from the result, which is useful for checks in CI.
- The online playground at jqplay.org is handy for building a tricky filter.
