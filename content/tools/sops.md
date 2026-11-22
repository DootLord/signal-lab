---
license: MPL-2.0
language: Go
---

## Features
- Values-only encryption: Keys and structure stay readable in YAML, JSON, .env and INI files; only the values are encrypted.
- Many key types: age, PGP, AWS KMS, GCP KMS, Azure Key Vault, HuaweiCloud KMS and HashiCorp Vault.
- Creation rules: A `.sops.yaml` file chooses keys by path, for example different keys for staging and production.
- Edit in place: `sops edit` decrypts to a temporary file, opens your editor, and re-encrypts when you save.
- Multiple recipients: Encrypt for several people and machines at once, and add or remove them with `sops updatekeys`.
- Tamper detection: A MAC over the file catches changes made without the keys.

## Strengths
- Secrets live in git next to the config that uses them, with history and code review.
- Diffs stay meaningful, because you can see which key changed even if you can't see its value.
- Supported directly by Flux, the Terraform SOPS provider, Ansible (community.sops) and Helm plugins.
- A CNCF Sandbox project with a long track record.

## Watch out for
- It isn't a runtime secrets manager: there's no access audit log, leasing or automatic rotation.
- Removing someone's access means rotating the secrets themselves, not just re-encrypting the file.
- Merge conflicts in encrypted files are awkward; resolve them by decrypting both sides.
- Losing every private key means losing the secrets, so keep a recovery key somewhere safe.

## Alternatives
- Sealed Secrets: Kubernetes-only; encrypts secrets that only the in-cluster controller can decrypt.
- git-crypt: Encrypts whole files in git, so diffs and review are lost.
- Ansible Vault: Built into Ansible, but tied to it and usually encrypts whole files.
- Vault, Infisical or Doppler: Central secrets services with access control and rotation, plus more to run or pay for.

## In depth
### Getting started with age
age keys are the simplest option for a team without a cloud key service:

```bash
brew install sops age
mkdir -p ~/.config/sops/age
age-keygen -o ~/.config/sops/age/keys.txt    # prints your public key (age1...)
sops encrypt --age age1yourpublickey... secrets.yaml > secrets.enc.yaml
sops edit secrets.enc.yaml                   # decrypt, edit, re-encrypt
sops decrypt secrets.enc.yaml                # print the cleartext
```

SOPS finds the private key through `SOPS_AGE_KEY_FILE`, `SOPS_AGE_KEY` or the default `keys.txt` location.

### Creation rules for a team
Put a `.sops.yaml` at the root of the repo so nobody has to pass keys on the command line:

```yaml
creation_rules:
  - path_regex: secrets/prod/.*
    age: age1prodkey...,age1oncallkey...
  - path_regex: secrets/.*
    age: age1alice...,age1bob...,age1ci...
```

After changing the recipients, run `sops updatekeys secrets/prod/app.yaml` to re-encrypt the file for the new list.

### Good to know
- `sops exec-env secrets.enc.env 'npm start'` runs a command with the decrypted values as environment variables, without writing them to disk.
- Add `--encrypted-regex '^(password|token|key)$'` to encrypt only matching keys and leave the rest of the file in clear text.
- The project moved from Mozilla to the CNCF in 2023; current docs are at getsops.io.
