---
name: production-observability
version: 1.0.0
description: Instrument new web application paths with actionable logs, metrics and traces.
applies_to: [frontend, backend, ai, integrations]
triggers:
  - adding a new request, database, queue or provider path
  - adding AI inference or agent/tool execution
  - changing SLOs, alerts or dashboards
requires_gate: gates/pre-merge/observability-evidence
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every new or materially changed production execution path. Avoid adding telemetry that has no diagnostic or operational purpose.

## 2. Non-negotiables

- Emit structured logs with stable event names and correlation/trace IDs.
- Record request rate, errors, latency and saturation for services.
- Trace cross-service, DB, queue, provider and model boundaries.
- Record prompt/model versions and token/cost metadata for AI paths.
- Never log secrets, auth headers, raw session tokens or unnecessary PII.
- Alerts must have an owner, severity, runbook and actionable threshold.
- Use sampling and cardinality controls to prevent telemetry cost explosions.

## 3. Rejection criteria

Reject new critical paths without useful telemetry, unbounded high-cardinality labels, alert rules without owners, or logging sensitive payloads.

## 4. Step-by-step procedure

1. Identify the operational questions the telemetry must answer.
2. Add spans at inbound and outbound boundaries.
3. Add RED metrics (rate, errors, duration) and saturation signals.
4. Add structured events for state transitions and failures.
5. Redact sensitive values before export.
6. Create SLO-based alerts and link runbooks.
7. Test telemetry emission and alert routing in a safe environment.

## 5. Evidence required

Dashboard/metric references, sample trace, redaction test, alert owner and runbook link.

## 6. Anti-patterns

- **REJECT:** logs containing whole request/response bodies by default.
- **REJECT:** user IDs, email addresses or raw URLs as unbounded metric labels.
- **REJECT:** alerts on every exception without user-impact context.
- **REJECT:** health checks that report healthy while critical dependencies are unusable.

## 7. References

- [Reliability baseline](../../../knowledge/reliability-baseline.md)
- [Observability evidence gate](../../../gates/pre-merge/observability-evidence/README.md)
