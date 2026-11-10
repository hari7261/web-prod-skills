---
name: background-jobs
version: 2.0.0
description: Design idempotent, bounded, observable background jobs with dead-letter queues and backpressure.
applies_to: [backend, reliability]
triggers:
  - adding async queues, workers, cron jobs, or event consumers
  - offloading slow email, webhook, AI, or export tasks
requires_gate: gates/pre-merge/observability-presence
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for all asynchronous workers, scheduled tasks, and queue consumers.

## 2. Non-negotiables

- Make every job handler idempotent (at-least-once delivery is the default).
- Configure explicit job timeout, max retry count with exponential backoff + jitter, and a Dead Letter Queue (DLQ) with alerting.
- Validate job payloads at worker consumption time and propagate `traceId` + `tenantId`.
- Enforce concurrency caps and queue-depth backpressure; never enqueue unbounded fan-out loops.

## 3. Rejection criteria

Fail the task if jobs retry forever without DLQ, lack timeouts or idempotency, pass raw secrets in job payloads, or omit logs/metrics/traces.

## 4. Step-by-step procedure

1. Define versioned job payload schema and idempotency key.
2. Set explicit timeout, max attempts, jittered backoff, and DLQ routing.
3. Emit structured logs, duration/failure metrics, and trace spans linked to the enqueuing request.
4. Test duplicate delivery, transient retry, and poison-pill DLQ routing.
5. Run `gates/pre-merge/observability-presence`.

## 5. Evidence required

Passing `gates/pre-merge/observability-presence` output, DLQ/retry config, and idempotency/poison-pill tests.

## 6. Anti-patterns

- **REJECT:** Firing `void doHeavyWork()` unawaited inside an HTTP request lifecycle without durable queue persistence.
- **REJECT:** Infinite retries on permanent 4xx validation errors.

## 7. References

- [Reliability baseline](../../../knowledge/reliability-baseline.md)
- [Observability presence gate](../../../gates/pre-merge/observability-presence/README.md)

