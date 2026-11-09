# Reliability baseline

## SLO and error budget

Every user-critical service declares availability and latency SLOs, measurement windows, ownership, and alert thresholds. Example starting targets (not universal requirements): 99.9% monthly availability; p95 API latency below 300 ms for ordinary read paths. Set targets from product requirements and observed baselines.

## Outbound and internal dependencies

- Set explicit connect, request, and overall deadlines.
- Retry only transient failures; use exponential backoff with jitter and a maximum attempt/deadline budget.
- Respect provider retry hints and rate limits.
- Use circuit breakers and concurrency limits where dependency failure can amplify load.
- Make retryable writes idempotent with stable idempotency keys.
- Bound queue depth, payload size, worker concurrency and processing time.
- Provide a defined degraded response or fallback; never silently return fabricated success.

## Operations

Instrument request rate, errors, latency, saturation, queue lag and dependency health. Alert on user-impacting SLO burn, not just process liveness. Document owner, escalation, rollback and recovery steps.
