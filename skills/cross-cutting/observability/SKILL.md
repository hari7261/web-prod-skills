---
name: observability
version: 2.0.0
description: Emit structured logs, RED metrics, and distributed trace spans on every network, database, and LLM path.
applies_to: [frontend, backend, ai, integrations]
triggers:
  - adding a new network, database, queue, or LLM call
  - configuring SLO dashboards or alerts
requires_gate: gates/pre-merge/observability-presence
resources: []
scripts: []
---

## 1. When to use / when not to use

Use on every new or modified service endpoint, database repository, background job, external API client, and LLM inference path.

## 2. Non-negotiables

- Emit JSON structured logs with stable event names, severity, `trace_id`, and `request_id` (scrubbed of secrets/PII).
- Record RED metrics (Rate, Errors, Duration) and saturation signals without unbounded high-cardinality labels (`userId`, `email`, raw URLs).
- Wrap inbound requests and outbound DB/HTTP/LLM/queue calls in trace spans propagating W3C `traceparent`.
- Tie alerts to SLO burn rate with an owner and runbook link.

## 3. Rejection criteria

Fail the task if network/DB/LLM paths lack logs, metrics, or trace spans, use unbounded metric labels, or fail `gates/pre-merge/observability-presence`.

## 4. Step-by-step procedure

1. Instrument inbound/outbound boundaries with `tracer.startSpan(...)` and `metrics`.
2. Emit structured lifecycle and failure logs via the shared logger.
3. Verify PII/secret scrubbing on log output (`skills/cross-cutting/logging-pii-scrubbing`).
4. Run `gates/pre-merge/observability-presence` and attach JSON output.

## 5. Evidence required

Passing `gates/pre-merge/observability-presence` JSON output, sample trace/log output, and alert-to-runbook link.

## 6. Anti-patterns

- **REJECT:** `console.log("error", err)` with unstructured strings or raw request headers.
- **REJECT:** Putting `user_id` or `email` in Prometheus metric labels.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Observability presence gate](../../../gates/pre-merge/observability-presence/README.md)

