---
name: quota-and-degradation
version: 2.0.0
description: Respect upstream API quotas with rate-limit awareness, circuit breakers, and explicit degraded modes.
applies_to: [backend, integrations, reliability]
triggers:
  - integrating rate-limited or metered third-party APIs
  - defining fallback UX when external dependencies degrade
requires_gate: gates/pre-merge/llm-call-resilience
resources: []
scripts: []
---

## 1. When to use / when not to use

Use when integrating any external API with rate limits, monthly quotas, or occasional brownouts.

## 2. Non-negotiables

- Honor `Retry-After` and `X-RateLimit-Remaining` headers; back off proactively before exhausting quotas.
- Isolate each third-party dependency behind a circuit breaker and bulkhead (bounded concurrency).
- Serve an explicit degraded experience (stale-while-revalidate cache, queued retry, or non-blocking feature fallback) rather than cascading `500` errors.
- Alert on quota burn rate (> 70% threshold) and circuit-breaker open transitions.

## 3. Rejection criteria

Fail the task if a third-party 429/503 brings down core web requests, retries ignore `Retry-After`, or degradation paths are untested.

## 4. Step-by-step procedure

1. Record provider rate limits and quotas in integration docs.
2. Add bulkhead concurrency limits, `Retry-After` handling, and circuit breaker.
3. Implement and test deterministic fallback behavior when circuit is open.
4. Run `gates/pre-merge/llm-call-resilience` and `gates/pre-merge/observability-presence`.

## 5. Evidence required

Passing `gates/pre-merge/llm-call-resilience` output and simulated 429/outage fallback tests.

## 6. Anti-patterns

- **REJECT:** Firing unbounded parallel requests to a rate-limited vendor API.
- **REJECT:** Letting an optional enrichment API outage fail checkout or login.

## 7. References

- [Integration baseline](../../../knowledge/integration-baseline.md)
- [Reliability baseline](../../../knowledge/reliability-baseline.md)

