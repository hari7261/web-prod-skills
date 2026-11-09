---
name: external-integrations
version: 1.0.0
description: Build bounded, secure, observable integrations with external providers.
applies_to: [backend, integrations]
triggers:
  - adding or changing a provider API integration
  - receiving webhooks
  - adding OAuth or third-party event processing
requires_gate: gates/pre-merge/integration-resilience
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for outbound provider APIs, inbound webhooks, OAuth connections, payment/identity providers, queues and SaaS integrations.

## 2. Non-negotiables

- Set connect, request and overall deadlines.
- Retry only transient errors with exponential backoff, jitter and bounded attempts.
- Use idempotency keys for retryable writes and deduplicate inbound events.
- Verify webhook signatures on raw bytes before parsing; enforce replay protection.
- Bound concurrency, payload size, queue depth and spend.
- Validate provider responses and treat them as untrusted.
- Redact tokens and sensitive payloads from logs.
- Define a degraded behavior and provider incident runbook.

## 3. Rejection criteria

Reject infinite retries, unbounded queues, missing timeouts, unverified webhooks, credentials in URLs, and duplicate side effects on retried requests.

## 4. Step-by-step procedure

1. Document provider contract, quotas, data classification and failure modes.
2. Define deadlines, retry classes, idempotency and circuit-breaker policy.
3. Implement signature verification or OAuth state/PKCE checks as applicable.
4. Validate response schemas and cap payload sizes.
5. Add provider request IDs, latency/error metrics and trace spans.
6. Test timeout, rate limit, malformed response, duplicate event and provider outage.
7. Document degraded mode, support escalation and credential rotation.

## 5. Evidence required

Contract reference, resilience tests, webhook/OAuth security tests, dashboards, alert rules and runbook.

## 6. Anti-patterns

- **REJECT:** retrying all 4xx/5xx errors identically.
- **REJECT:** acknowledging webhooks before durable acceptance.
- **REJECT:** trusting a webhook body without signature validation.
- **REJECT:** assuming provider uptime equals application availability.

## 7. References

- [Integration baseline](../../../knowledge/integration-baseline.md)
- [Reliability baseline](../../../knowledge/reliability-baseline.md)
