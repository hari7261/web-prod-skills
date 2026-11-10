---
name: error-boundaries
version: 2.0.0
description: Isolate UI rendering failures with scoped error boundaries, recovery actions, and sanitized telemetry.
applies_to: [frontend, ui]
triggers:
  - adding new page routes or layout shells
  - rendering third-party widgets or dynamic data visualizations
  - handling async UI failures
requires_gate: gates/pre-merge/tests-unit-integration
resources: []
scripts: []
---

## 1. When to use / when not to use

Use on every route layout, widget panel, and async UI boundary so local rendering faults do not crash the whole application.

## 2. Non-negotiables

- Wrap every route segment and independent widget panel in an Error Boundary with a reset/retry action.
- Display user-safe fallback copy; never render raw stack traces, SQL errors, or internal tokens in the DOM.
- Emit structured error telemetry with route, boundary ID, and trace correlation ID (scrubbed of PII).
- Handle global `unhandledrejection` and root-level fatal fallbacks cleanly.

## 3. Rejection criteria

Fail the task if a rendering error whites out the entire app, exposes raw internal error messages/stack traces to users, or swallows errors without telemetry.

## 4. Step-by-step procedure

1. Place route-level and widget-level Error Boundaries using `templates/frontend-app/ErrorBoundary.tsx`.
2. Provide explicit recovery controls (`Retry`, `Reload`, or safe navigation).
3. Wire `onReport` to structured frontend error telemetry with PII scrubbing.
4. Test throwing-child scenarios and recovery resets in `gates/pre-merge/tests-unit-integration`.

## 5. Evidence required

Automated tests verifying fallback UI rendering, stack-trace suppression, retry recovery, and passing `gates/pre-merge/tests-unit-integration` output.

## 6. Anti-patterns

- **REJECT:** Rendering `{error.stack}` directly in production JSX.
- **REJECT:** Empty `catch {}` around async UI handlers leaving spinners stuck forever.

## 7. References

- [Frontend baseline](../../../knowledge/frontend-baseline.md)
- [Reliability baseline](../../../knowledge/reliability-baseline.md)

