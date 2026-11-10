---
name: third-party-api-client
version: 2.0.0
description: Wrap external HTTP/SDK integrations with deadlines, jittered retries, SSRF defense, and response validation.
applies_to: [backend, integrations]
triggers:
  - calling an external SaaS or partner HTTP API
  - fetching user-provided URLs or metadata
requires_gate: gates/pre-merge/observability-presence
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every outbound HTTP client or vendor SDK call. Never call external APIs directly from route handlers without bounded resilience.

## 2. Non-negotiables

- Set connect, request, and total wall-clock timeouts on every call (`templates/integration-client/resilient-client.ts`).
- Retry only idempotent/transient failures (`429`, `502`, `503`, `504`, network resets) with exponential backoff + jitter and max 2–3 attempts.
- Validate external API responses against a schema before trusting fields.
- If destination URLs come from users/LLMs/webhooks, enforce SSRF allowlists blocking loopback, link-local (`169.254.0.0/16`), and private IP ranges, and revalidate redirects.
- Emit structured logs, latency/error metrics, and trace spans without leaking API keys.

## 3. Rejection criteria

Fail the task if outbound requests lack timeouts, retry non-idempotent POSTs blindly, allow SSRF to private/metadata IPs, or fail `gates/pre-merge/observability-presence`.

## 4. Step-by-step procedure

1. Implement client wrapper using `templates/integration-client/resilient-client.ts`.
2. Enforce strict response schema validation and byte-size caps.
3. Add SSRF IP/scheme checks for any dynamic URLs.
4. Test timeout, `429` Retry-After, `503`, and malformed payload responses.
5. Run `gates/pre-merge/observability-presence` and `gates/pre-merge/sast`.

## 5. Evidence required

Passing `gates/pre-merge/observability-presence` and `gates/pre-merge/sast` outputs plus resilience unit tests.

## 6. Anti-patterns

- **REJECT:** `await fetch(url)` with default infinite/OS timeout and no `try/catch` or schema check.
- **REJECT:** Retrying `400 Bad Request` or `401 Unauthorized` in a tight loop.

## 7. References

- [Integration baseline](../../../knowledge/integration-baseline.md)
- [Reliability baseline](../../../knowledge/reliability-baseline.md)
