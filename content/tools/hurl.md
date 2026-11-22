---
license: Apache-2.0
language: Rust
---

## Features
- Plain-text requests: Each `.hurl` file is a list of requests written much like a raw HTTP message, with headers and bodies inline.
- Rich asserts: Check status, headers, JSONPath, XPath, regex, cookies, response time and certificate details.
- Captures: Pull a value from one response (a token, an ID, a CSRF field) and use it in later requests.
- Test mode: `hurl --test` runs many files, in parallel by default, and prints a pass/fail summary.
- CI reports: Writes JUnit, TAP, HTML and JSON reports for CI dashboards.
- Built on libcurl: Behaves like curl, and `--verbose` and `--very-verbose` show exactly what went over the wire.

## Strengths
- The test files are short, readable and easy to review in a pull request.
- A single binary with no runtime, so it drops into any CI image.
- Equally useful for quick manual checks and for a proper integration test suite.
- Mature and actively maintained, with frequent releases.

## Watch out for
- It's its own small file format: there's no GUI and no import from Postman collections.
- Complex logic (loops, conditionals, data-driven tests) is limited by design; use a programming language for that.
- It isn't a load-testing tool, even though it can repeat and parallelise requests.

## Alternatives
- Bruno: A GUI API client with collections stored as plain text in your repo.
- Postman with Newman: A familiar GUI with a CLI runner for CI, but collections are large JSON files tied to an account.
- curl with jq: Fine for one-offs; assertions and chaining quickly turn into fragile shell scripts.
- k6: Scriptable in JavaScript and built for load testing rather than functional checks.

## In depth
### What a test looks like
A Hurl file is a sequence of requests, each followed by optional asserts and captures:

```hurl
# Log in and keep the token
POST https://api.example.com/login
{
  "user": "demo",
  "password": "{{password}}"
}
HTTP 200
[Captures]
token: jsonpath "$.token"

# Use it
GET https://api.example.com/me
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.name" == "demo"
header "Content-Type" contains "json"
duration < 500
```

Variables such as `{{password}}` come from `--variable`, a variables file or environment variables, so secrets stay out of the file.

### A typical workflow

```bash
hurl --test --variable password="$PASSWORD" tests/*.hurl
hurl --test --report-junit build/hurl.xml tests/
hurl --very-verbose tests/login.hurl   # debug one file
```

Keep one folder of `.hurl` files per service and run them against a local server in CI after the build, then against staging after deploys.

### Good to know
- Hurl is maintained by Orange's open-source team and has been in steady development since 2020.
- Editor support (syntax highlighting) exists for VS Code, IntelliJ and others.
- Install with Homebrew, Cargo, npm (`@orangeopensource/hurl`), Docker, winget or the release binaries.
