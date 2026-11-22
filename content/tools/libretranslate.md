---
license: AGPL-3.0
language: Python
---

## Features
- Translation API: `POST /translate` with text, source and target languages, or `source: "auto"` for detection.
- Language detection: `POST /detect` identifies the language of a text with a confidence score.
- File translation: Translate documents (such as .txt, .docx and .pdf) through `/translate_file`.
- Fully offline: Uses open Argos Translate models that run on your own hardware; no calls to Google or Azure.
- Access control: Optional API keys and per-client rate limits for shared instances.
- Web UI and Docker images: A built-in translation page, plus CPU and CUDA container images.

## Strengths
- Private by design: text never leaves your infrastructure, which matters for user content and regulated data.
- No per-character fees, so translation cost is just the server it runs on.
- A simple HTTP API that's easy to call from any language.
- Mature and actively maintained since 2020, with a public instance to try before you host.

## Watch out for
- Quality is generally below DeepL or Google for many language pairs, so test with your own content.
- Language models take disk space and RAM; use `--load-only` to limit languages.
- It's AGPL-licensed: if you modify it and offer it as a network service, you must share your changes.
- CPU translation of long texts is slow; a GPU image helps at volume.

## Alternatives
- DeepL API: Excellent quality for supported languages, paid and hosted.
- Google Cloud Translation / Azure Translator: Broad language coverage, pay per character, hosted.
- Argos Translate: The underlying library, usable directly from Python without the HTTP server.
- LLMs (hosted or local via Ollama): Flexible and context-aware, but slower and less predictable for bulk translation.

## In depth
### Running it

```bash
docker run -ti --rm -p 5000:5000 libretranslate/libretranslate
# or
pip install libretranslate
libretranslate --load-only en,es,de,fr
```

The first start downloads language models, so keep a volume for them in production to avoid downloading on every boot.

### Calling the API

```bash
curl -X POST http://localhost:5000/translate \
  -H 'Content-Type: application/json' \
  -d '{"q": "Your order has shipped", "source": "en", "target": "de", "format": "text"}'
# {"translatedText": "Ihre Bestellung wurde versandt"}

curl -X POST http://localhost:5000/detect \
  -H 'Content-Type: application/json' -d '{"q": "Bonjour tout le monde"}'
```

`q` can also be an array to translate several strings in one request, which is handy for UI string files.

### Where it shines
- Translating user-generated content (support tickets, reviews, chat) without sending it to a third party.
- First-draft translations of i18n string files for human translators to review.
- Offline or air-gapped environments.

### Good to know
- Enable `--api-keys` and request limits before exposing an instance publicly.
- Pin the image version and keep the model volume, so upgrades are deliberate.
