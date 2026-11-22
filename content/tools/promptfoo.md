---
license: MIT
language: TypeScript
---

## Features
- Declarative test suites: Describe prompts, model providers and test cases in a simple YAML file.
- Many providers: OpenAI, Anthropic, Google, Azure, Bedrock, local models via Ollama, or any HTTP endpoint, including your own app.
- Assertions: Deterministic checks (contains, regex, is-json, JavaScript) and model-graded ones (llm-rubric, factuality, similarity).
- Comparison view: A web viewer shows every prompt × model × test case side by side, with pass/fail and cost.
- CI integration: Run evals in CI and fail the build when quality regresses.
- Red teaming: Generates adversarial inputs to probe for prompt injection, jailbreaks and data leakage.

## Strengths
- Turns "I tweaked the prompt and it seems better" into a repeatable, reviewable test run.
- Easy to compare models or prompt versions on your own cases before switching.
- Runs locally, and results are cached, so repeated runs are cheap.
- Plain-text config lives next to your code and gets reviewed in pull requests.

## Watch out for
- Model-graded assertions cost money and can be inconsistent. Use deterministic checks wherever possible.
- An eval is only as good as its test cases, so invest in realistic, diverse examples.
- Large test matrices across several paid models add up quickly. Watch the cost column.

## Alternatives
- OpenAI Evals: An eval framework from OpenAI, more research-oriented.
- DeepEval: Pytest-style LLM testing for Python projects.
- Inspect: The UK AI Security Institute's framework, strong for agentic and safety evals.
- LangSmith / Braintrust: Hosted platforms that combine evals with tracing and dataset management.

## In depth
### How it works
You write a `promptfooconfig.yaml` listing prompts (with `{{variables}}`), the providers to run them against, and test cases that fill in variables and assert things about the output. `promptfoo eval` runs the full matrix, caches responses, scores every assertion and stores the results. `promptfoo view` opens a local web UI to browse and compare them.

### A minimal suite

```yaml
description: Support reply summariser
prompts:
  - "Summarise this customer message in one sentence for an agent: {{message}}"
providers:
  - openai:gpt-5-mini
  - ollama:chat:llama3.2
tests:
  - vars:
      message: "My invoice from March was charged twice and I need a refund."
    assert:
      - type: icontains
        value: refund
      - type: javascript
        value: output.split('.').filter(Boolean).length <= 2
      - type: llm-rubric
        value: Mentions the duplicate charge and is a single sentence
```

```bash
npx promptfoo@latest eval
npx promptfoo@latest view
```

### Using it well
- Start with 10 to 20 real examples from logs or support tickets, including the awkward ones.
- Prefer cheap deterministic assertions, and keep model-graded rubrics for things that genuinely need judgement.
- Add the eval to CI so prompt changes come with evidence, and keep failing cases as regression tests.
- Model names change often. Keep provider IDs in one place so swapping a model is a one-line change.
