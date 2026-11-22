---
license: MIT
language: Go
---

## Features
- Catch-all SMTP server: Accepts every email your app sends and never delivers it anywhere.
- Web inbox: Browse messages with HTML, plain-text, source and header views, plus attachments.
- HTML compatibility check: Flags HTML and CSS features that popular email clients don't support.
- Link and spam checks: Tests links in your emails, and can score messages with SpamAssassin.
- REST API: List, search, read and delete messages from automated tests.
- Lightweight: A single binary or a small Docker image, with optional SQLite persistence.

## Strengths
- No more test emails accidentally sent to real users, or to your own inbox.
- Great for reviewing email templates: see exactly what was sent, in each format.
- The API makes end-to-end tests of sign-up and password-reset flows straightforward.
- Actively maintained, unlike MailHog which it was built to replace.

## Watch out for
- It's for development and testing only, not a mail server for production.
- The UI has no authentication by default; don't expose it publicly, or enable basic auth.
- It keeps a limited number of messages by default (older ones are pruned); raise the limit if you need more.

## Alternatives
- MailHog: The previous go-to tool, now unmaintained.
- MailCatcher: A Ruby-based catcher with a simple UI.
- smtp4dev: A .NET-based equivalent with a web UI.
- Mailtrap: A hosted email sandbox with team features.

## In depth
### Running it
In docker compose, next to your app:

```yaml
services:
  mailpit:
    image: axllent/mailpit
    ports:
      - "8025:8025"   # web UI and API
      - "1025:1025"   # SMTP
```

Point your app's SMTP settings at host `mailpit` (or `localhost`) on port `1025`, with no TLS and no authentication. Open http://localhost:8025 to see what was sent.

### Asserting on emails in tests

```ts
// after triggering a password reset in an end-to-end test
const res = await fetch('http://localhost:8025/api/v1/messages');
const { messages } = await res.json();
const reset = messages.find((m) => m.Subject.includes('Reset your password'));
expect(reset).toBeDefined();
```

The API also offers search and full message retrieval (HTML, text and headers), so you can extract and follow the reset link in a browser test.

### Good to know
- Use `MP_MAX_MESSAGES` to change how many messages are kept, and `MP_DATABASE` to persist them to a file.
- Mailpit can also release a captured message to a real SMTP server, which is useful for checking rendering in actual clients.
