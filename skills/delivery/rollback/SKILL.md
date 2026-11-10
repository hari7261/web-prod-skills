---
name: rollback
version: 2.0.0
description: Ensure every deploy and schema change has a documented, tested, and automatable rollback path.
applies_to: [delivery, reliability]
triggers:
  - preparing a production release or infrastructure change
  - configuring automated post-deploy rollback hooks
requires_gate: gates/pre-deploy/rollback-plan-present
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every production deployment, configuration rollout, and database migration. Rollback exists or it doesn't ship.

## 2. Non-negotiables

- Record the exact prior immutable version (`targetVersion`), executable rollback command (`command`), and owner before deploying (`rollback-plan.json`).
- Test the rollback procedure in staging/dry-run prior to release (`tested: true`).
- Wire `gates/post-deploy/auto-rollback-trigger` to invoke rollback automatically on canary/SLO failure and record the incident link.
- Keep N-1 application compatibility for database schemas so code rollback never breaks on newly added columns.

## 3. Rejection criteria

Fail the task if rollback steps are undocumented, untested (`tested: false`), lack automated post-deploy trigger hooks, or fail `gates/pre-deploy/rollback-plan-present`.

## 4. Step-by-step procedure

1. Document `rollback-plan.json` with `targetVersion`, `command`, `owner`, and test in staging.
2. Run `gates/pre-deploy/rollback-plan-present`.
3. Configure post-deploy health/SLO monitors wired to `gates/post-deploy/auto-rollback-trigger`.
4. Verify rollback completes within recovery time objective (RTO) and restores green smoke tests.

## 5. Evidence required

Passing `gates/pre-deploy/rollback-plan-present` and `gates/post-deploy/auto-rollback-trigger` JSON outputs.

## 6. Anti-patterns

- **REJECT:** "Rollback is `git revert` and wait 20 minutes for CI rebuild."
- **REJECT:** Shipping destructive DB drops that prevent rolling back the application binary.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Rollback plan gate](../../../gates/pre-deploy/rollback-plan-present/README.md)
- [Auto-rollback gate](../../../gates/post-deploy/auto-rollback-trigger/README.md)
