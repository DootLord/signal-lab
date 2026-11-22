---
license: BSD-3-Clause
language: Go
---

## Features
- Local certificate authority: `mkcert -install` creates a private CA and adds it to the system, browser (including Firefox) and Java trust stores.
- Any names: Issue certificates for localhost, custom hosts (`myapp.test`), wildcards (`*.myapp.test`) and IP addresses in one command.
- Flexible output: PEM files by default, PKCS#12 with `-pkcs12`, custom file names with `-cert-file` and `-key-file`.
- Client certificates: `-client` issues certificates for testing mutual TLS.
- Cross-platform: macOS, Linux and Windows.

## Strengths
- Real green-padlock HTTPS locally in under a minute, with no browser warnings to click through.
- Lets you test features that need a secure context: secure cookies, service workers, OAuth redirects, HTTP/2 and WebAuthn.
- Tiny, focused and written by a well-known Go security engineer.

## Watch out for
- Never share or commit `rootCA-key.pem`; anyone with it can create certificates your machine trusts.
- Certificates only work on machines where the CA is installed; phones and other devices need it installed manually.
- It's for development only, not for production certificates.

## Alternatives
- Self-signed with openssl: No install, but browsers warn and you have to manage the trust exceptions yourself.
- Caddy's internal CA: `tls internal` in Caddy does something similar automatically for sites it serves.
- step-ca: A full private CA with automation, for teams and internal infrastructure.

## In depth
### How it works
mkcert generates a root certificate unique to your machine and installs it into the trust stores your browsers and tools use. Certificates it issues are signed by that root, so they're trusted locally, and only locally, without any warnings. The CA files live in the directory shown by `mkcert -CAROOT`.

### Typical use

```bash
mkcert -install
mkcert localhost 127.0.0.1 ::1 myapp.test "*.myapp.test"
# -> ./localhost+4.pem and ./localhost+4-key.pem
```

Use the files in your dev server. For example, with Vite:

```ts
// vite.config.ts
import fs from 'node:fs';
export default {
  server: {
    https: {
      cert: fs.readFileSync('./localhost+4.pem'),
      key: fs.readFileSync('./localhost+4-key.pem'),
    },
  },
};
```

### Good to know
- Node.js doesn't use the system trust store by default; set `NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"` so Node clients trust your local certificates.
- Add the generated `.pem` files to `.gitignore`.
- Run `mkcert -uninstall` to remove the CA from your trust stores.
