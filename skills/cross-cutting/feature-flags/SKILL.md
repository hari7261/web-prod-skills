---
name: feature-flags
version: 2.0.0
description: Roll out high-risk changes behind owned, kill-switchable feature flags with explicit expiry and safe defaults.
applies_to: [frontend, backend, delivery]
triggers:
  - shipping risky or incremental product features
  - decoupling code deploy from feature release
requires_gate: gates/pre-deploy/env-config-diff
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for gradual rollouts, high-risk refactors, AI model swaps, and dark launches.

## 2. Non-negotiables

- Every flag declares `owner`, `defaultEnabled`, `killSwitch`, `fallbackBehavior`, and `expiresAt` (`templates/feature-flag/flag.config.json`).
- Fail closed (or to proven legacy path) if flag evaluation errors or times out.
- Never embed unreleased admin-flag secrets or hidden privileged routes exclusively behind client-side flag checks—enforce flags server-side too.
- Clean up stale flags after 100% rollout + soak window.

## 3. Rejection criteria

Fail the task if a flag has no safe fallback, lacks server-side enforcement for privileged behavior, or introduces unreviewed config drift in `gates/pre-deploy/env-config-diff`.

## 4. Step-by-step procedure

1. Define flag config using `templates/feature-flag/`.
2. Test both `enabled` and `disabled/fallback` code paths in CI.
3. Verify kill-switch instant disablement without redeployment.
4. Run `gates/pre-deploy/env-config-diff`.

## 5. Evidence required

Passing `gates/pre-deploy/env-config-diff` output and tests for both flag states.

## 6. Anti-patterns

- **REJECT:** Permanent boolean flags left in code for years with no owner or cleanup plan.
- **REJECT:** Relying on a frontend-only flag to gate a paid or admin backend capability.

## 7. References

- [Reliability baseline](../../../knowledge/reliability-baseline.md)
- [Env config diff gate](../../../gates/pre-deploy/env-config-diff/README.md)

