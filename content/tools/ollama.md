---
license: MIT
language: Go
---

## Features
- One-command models: `ollama run <model>` downloads and starts a model from the Ollama library.
- GPU acceleration: Uses NVIDIA (CUDA), AMD (ROCm) and Apple Silicon (Metal), and falls back to the CPU.
- Local HTTP API: Has its own REST API plus OpenAI-compatible `/v1` endpoints, so existing SDKs work by changing the base URL.
- Modelfiles: Package a model with a system prompt, parameters and adapters, Dockerfile-style.
- Tool calling, vision and structured output: Supported for models that have those abilities.
- Model management: `pull`, `list`, `ps` and `rm`, with models kept in memory between requests.

## Strengths
- By far the easiest way to get a local model running, on macOS, Windows and Linux.
- Supported by almost every AI framework, editor and agent tool as a provider.
- No per-token cost and no data leaves your machine, which suits prototyping and sensitive work.
- Very active project that adds new open-weight model families quickly.

## Watch out for
- Local models are far smaller than frontier hosted models; expect weaker reasoning and coding.
- Quality and speed depend heavily on your RAM and VRAM; large models run slowly or not at all on a laptop.
- The default context length is modest; raise it with `OLLAMA_CONTEXT_LENGTH` or the `num_ctx` parameter for long prompts.
- Ollama also offers hosted cloud models. Those run on Ollama's servers, not yours, so check which kind you've pulled.
- It binds to localhost by default; exposing it on a network has no built-in authentication.

## Alternatives
- llama.cpp: The engine underneath many local runners; more control, more setup.
- LM Studio: A desktop GUI for downloading and chatting with local models, with a local server.
- vLLM: For serving models to many users on proper GPU servers.
- Hosted APIs (OpenAI, Anthropic, OpenRouter): Much stronger models, paid per token.

## In depth
### Quick start

```bash
ollama run gpt-oss:20b          # chat in the terminal
ollama pull qwen3:8b            # just download
ollama list                     # what's installed
ollama ps                       # what's loaded in memory
```

### Use it from code via the OpenAI SDK

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
reply = client.chat.completions.create(
    model="gpt-oss:20b",
    messages=[{"role": "user", "content": "Summarise this diff: ..."}],
)
print(reply.choices[0].message.content)
```

### A custom model

```text
# Modelfile
FROM qwen3:8b
PARAMETER temperature 0.2
SYSTEM You are a terse code reviewer. Reply in bullet points.
```

```bash
ollama create reviewer -f Modelfile
ollama run reviewer
```

### Good to know
- Set `OLLAMA_HOST=0.0.0.0` to serve other machines, but put it behind a reverse proxy with auth.
- The official Docker image (`ollama/ollama`) works well on GPU servers with the NVIDIA container toolkit.
- Rough rule: a model needs about its download size in free RAM or VRAM, plus room for the context.
