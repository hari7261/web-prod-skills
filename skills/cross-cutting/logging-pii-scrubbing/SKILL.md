---
name: logging-pii-scrubbing
version: 2.0.0
description: Scrub credentials, tokens, cookies, and sensitive PII from all application logs and error telemetry.
applies_to: [backend, frontend, ai, security]
triggers:
  - adding structured logging or request/response logging middleware
  - configuring Sentry, OpenTelemetry, or error reporters
requires_gate: gates/pre-merge/observability-presence
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever configuring loggers, HTTP access logs, audit trails, or crash/error telemetry.

## 2. Non-negotiables

- Redact `authorization`, `cookie`, `set-cookie`, `x-api-key`, `password`, `token`, `secret`, `ssn`, and payment fields automatically at the logger serializer layer.
- Never log full request bodies, raw prompts, or raw database rows by default.
- Avoid logging user emails/IPs in plaintext telemetry when opaque user/tenant IDs suffice.
- Include unit tests asserting secret and PII redaction before logs leave the process.

## 3. Rejection criteria

Fail the task if bearer tokens, cookies, passwords, API keys, or unredacted PII appear in logs.

## 4. Step-by-step procedure

1. Configure logger redaction paths (`redact: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token"]`).
2. Log explicit allowlisted metadata fields instead of whole objects.
3. Add automated logger redaction tests using synthetic credentials and PII.
4. Run `gates/pre-merge/observability-presence` and `gates/pre-commit/secrets-scan`.

## 5. Evidence required

Passing `gates/pre-merge/observability-presence` output plus redaction unit tests.

## 6. Anti-patterns

- **REJECT:** `logger.info({ headers: req.headers, body: req.body })`.
- **REJECT:** Logging decrypted OAuth tokens during troubleshooting.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)
