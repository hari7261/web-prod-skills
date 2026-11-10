---
name: secrets-management
version: 2.0.0
description: Keep credentials, API keys, and private keys out of source code, frontend bundles, committed env files, and logs.
applies_to: [web, security]
triggers:
  - adding configuration or credentials
  - handling API keys, tokens, or signing secrets
  - reviewing secrets or environment variables
requires_gate: gates/pre-commit/secrets-scan
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever configuring credentials, API keys, webhooks, OAuth secrets, signing keys, or database URLs.

## 2. Non-negotiables

- Inject secrets strictly at runtime from a secret manager or deployment environment; never commit `.env` files (only `.env.example` with placeholder values).
- Never expose server secrets in `NEXT_PUBLIC_*`, `VITE_*`, client bundles, SSR hydration payloads, or URL query strings.
- Validate required runtime secrets at process startup and fail fast if missing.
- Rotate any credential immediately if detected in git history, logs, or artifacts.

## 3. Rejection criteria

Fail the task if secrets appear in source, client bundles, committed `.env` files, or logs, or if `gates/pre-commit/secrets-scan` fails.

## 4. Step-by-step procedure

1. Document required variables in `.env.example` without real values.
2. Validate environment configuration at server boot.
3. Verify zero secret leakage into client bundles or structured logs.
4. Run `gates/pre-commit/secrets-scan` and attach JSON output.

## 5. Evidence required

Passing JSON output from `gates/pre-commit/secrets-scan` and clean startup config validation.

## 6. Anti-patterns

- **REJECT:** Hardcoded API keys, private keys, or default fallback secrets (`secret || "dev-secret"`).
- **REJECT:** Committing `.env` or `.env.production` to git.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Secrets scan gate](../../../gates/pre-commit/secrets-scan/README.md)
