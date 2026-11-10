---
name: error-handling
version: 2.0.0
description: Handle errors explicitly with typed error boundaries, safe client responses, and zero swallowed exceptions.
applies_to: [backend, frontend, cross-cutting]
triggers:
  - writing try/catch blocks or Express/Fastify/Next error middleware
  - mapping internal failures to HTTP/GraphQL errors
requires_gate: gates/pre-merge/observability-presence
resources: []
scripts: []
---

## 1. When to use / when not to use

Use across all backend routes, workers, integrations, and UI async handlers.

## 2. Non-negotiables

- Never swallow exceptions silently (`catch {}` or `except: pass`); every caught error must either be handled with explicit recovery/fallback or rethrown with context.
- Return sanitized, stable error envelopes (`code`, `message`, `requestId`) to clients; never expose stack traces, SQL queries, or internal hostnames in production responses.
- Distinguish expected operational errors (`4xx` validation/authz/not-found) from unexpected faults (`5xx`) in logs, metrics, and alerts.

## 3. Rejection criteria

Fail the task if exceptions are swallowed, stack traces leak to HTTP clients, or unexpected failures return `200 OK`.

## 4. Step-by-step procedure

1. Classify domain errors into typed `AppError` classes with HTTP status and safe public code.
2. Add centralized error middleware that logs full scrubbed context internally and returns safe client JSON.
3. Add tests asserting `500` responses omit stack traces and `catch` blocks emit telemetry.
4. Run `gates/pre-merge/sast` and `gates/pre-merge/observability-presence`.

## 5. Evidence required

Passing `gates/pre-merge/sast` and `gates/pre-merge/observability-presence` outputs plus error-mapping tests.

## 6. Anti-patterns

- **REJECT:** `try { await charge(); } catch (e) {}` silently ignoring failure.
- **REJECT:** `res.status(500).json({ error: err.stack })`.

## 7. References

- [Anti-patterns](../../../knowledge/anti-patterns.md)
- [Reliability baseline](../../../knowledge/reliability-baseline.md)
