---
name: rate-limiting
version: 2.0.0
description: Protect endpoints, auth flows, and expensive AI/compute paths with bounded rate limiting and backpressure.
applies_to: [backend, api, security]
triggers:
  - adding public, auth, password-reset, or OTP endpoints
  - exposing AI generation, search, or export endpoints
  - defending against brute force or abusive traffic
requires_gate: gates/pre-merge/sast
resources: []
scripts: []
---

## 1. When to use / when not to use

Use on authentication endpoints, public APIs, webhook receivers, file uploads, and expensive LLM/search endpoints.

## 2. Non-negotiables

- Apply sliding-window or token-bucket rate limits keyed by IP + authenticated user/tenant ID.
- Use stricter limits on auth/OTP/reset endpoints and cost-weighted limits on LLM/export routes.
- Return `429 Too Many Requests` with `Retry-After` and standard `RateLimit-*` headers; fail safe when the rate-limit store degrades.
- Bound request concurrency and body sizes before expensive parsing or DB/LLM work.

## 3. Rejection criteria

Fail the task if auth or AI endpoints have no rate limit, limits rely solely on spoofable `X-Forwarded-For` without trusted-proxy config, or store outage crashes requests with `500`.

## 4. Step-by-step procedure

1. Classify endpoint risk tier (auth, AI/expensive, standard mutation, read).
2. Configure distributed store (Redis/edge limiter) with trusted proxy IP extraction.
3. Emit rate-limit hit metrics and structured logs (without raw IP/token PII if sensitive).
4. Test `429` behavior, `Retry-After` header, and limiter-store fallback.

## 5. Evidence required

Integration tests verifying `429` enforcement and passing `gates/pre-merge/sast` + `gates/pre-merge/tests-unit-integration` output.

## 6. Anti-patterns

- **REJECT:** In-memory `Map` rate limiting across multi-instance production pods for security-critical auth brute-force defense.
- **REJECT:** Trusting raw `X-Forwarded-For` headers from arbitrary internet clients.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [Reliability baseline](../../../knowledge/reliability-baseline.md)

