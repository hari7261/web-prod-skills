---
name: deployment-strategy
version: 2.0.0
description: Ship production releases via progressive canary rollouts with observation windows and explicit abort criteria.
applies_to: [delivery, reliability]
triggers:
  - planning or executing a production deployment
  - configuring canary, blue-green, or progressive traffic shifting
requires_gate: gates/pre-deploy/canary-plan-present
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every production deployment of web frontends, APIs, workers, and AI endpoints.

## 2. Non-negotiables

- Declare progressive canary traffic slices (<= 25% initial canary), an observation window (>= 10 minutes), and quantitative abort criteria (`5xx` rate, p99 latency, safety/eval errors).
- Review environment/config diffs (`gates/pre-deploy/env-config-diff`) before shifting production traffic.
- Validate post-deploy smoke tests, error-rate vs baseline, SLOs, and Web Vitals before promoting to 100%.

## 3. Rejection criteria

Fail the task if a release pushes straight to 100% with no canary plan, omits abort criteria, or fails `gates/pre-deploy/canary-plan-present`.

## 4. Step-by-step procedure

1. Author `deploy-plan.yaml` with `canary_percent`, `observation_window_minutes`, and `abort_criteria`.
2. Run `gates/pre-deploy/canary-plan-present` and `gates/pre-deploy/env-config-diff`.
3. Deploy canary and execute `gates/post-deploy/smoke-tests`, `error-rate-vs-baseline`, `slo-check`, and `web-vitals-check`.
4. Promote only after all post-deploy gates pass; otherwise trigger rollback.

## 5. Evidence required

Passing `gates/pre-deploy/canary-plan-present` and `gates/post-deploy/*` JSON outputs.

## 6. Anti-patterns

- **REJECT:** Big-bang 100% Friday night deploys with no observation window.
- **REJECT:** "We'll watch Slack to see if anything breaks" instead of numeric abort criteria.

## 7. References

- [Production readiness](../../../knowledge/production-readiness.md)
- [Canary plan gate](../../../gates/pre-deploy/canary-plan-present/README.md)

