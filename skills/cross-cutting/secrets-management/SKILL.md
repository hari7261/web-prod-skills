---
name: secrets-management
version: 1.0.0
description: Keep credentials out of source, artifacts, logs, and client bundles.
applies_to: [frontend, backend, ci]
triggers:
  - adding credentials or provider configuration
  - changing environment variables or deployment secrets
  - investigating suspected credential exposure
requires_gate: gates/pre-commit/secrets-scan
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever code, configuration, CI, logs, build artifacts, or operational procedures touch credentials. Public configuration such as an OAuth client ID is not automatically a secret, but must still be classified.

## 2. Non-negotiables

- Store secrets in an approved secret manager or deployment secret store.
- Never expose server credentials to browser bundles or public build variables.
- Never commit live `.env` files, private keys, tokens, or credentials.
- Redact authorization headers, cookies, tokens and sensitive provider payloads from logs.
- Rotate credentials immediately after suspected exposure; deleting the file does not revoke the secret.
- Use least-privilege credentials and separate environments.

## 3. Rejection criteria

Reject committed credentials, secrets embedded in frontend code, credentials passed through query strings, unredacted auth logs, shared production/development credentials, or a rotation plan that depends only on deleting Git history.

## 4. Step-by-step procedure

1. Classify the value and identify where it executes (browser, server, CI, operator workstation).
2. Select the approved secret store and define access policy.
3. Inject at runtime; expose only explicitly public values to client builds.
4. Redact telemetry and error reporting.
5. Add rotation and revocation instructions.
6. Run the secrets gate and provider scanning.
7. If exposure occurred, revoke/rotate first, then purge affected artifacts/history as appropriate.

## 5. Evidence required

Secrets gate JSON, secret-store reference/configuration, access policy, and rotation evidence where relevant. A clean working-tree scan does not prove Git history or build artifacts are clean.

## 6. Anti-patterns

- **REJECT:** `NEXT_PUBLIC_*`, `VITE_*` or equivalent prefixes for private credentials.
- **REJECT:** logging complete request headers or provider errors with embedded tokens.
- **REJECT:** committing encrypted secrets without a reviewed key-management design.
- **REJECT:** assuming deleting a secret from the latest commit makes it safe.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [Secrets scan gate](../../../gates/pre-commit/secrets-scan/README.md)
