---
name: database-migrations
version: 1.0.0
description: Ship safe, observable, reversible database schema and data changes.
applies_to: [backend, database]
triggers:
  - changing schema, indexes, constraints or stored data
  - adding backfills or data transformations
  - changing database access patterns
requires_gate: gates/pre-deploy/migration-safety
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for schema changes, index changes, data backfills and destructive data operations.

## 2. Non-negotiables

- Prefer expand/contract migrations for zero-downtime deployments.
- Estimate lock duration and resource impact on production-shaped data.
- Backfills are resumable, chunked, rate-limited and observable.
- Preserve compatibility across mixed application versions during rollout.
- Provide a tested rollback or explicitly approved forward-fix plan for irreversible operations.
- Take backups and define recovery-point/recovery-time expectations for destructive changes.

## 3. Rejection criteria

Reject unbounded table rewrites, long blocking locks without maintenance planning, destructive migrations before compatible code is deployed, and untested rollback plans.

## 4. Step-by-step procedure

1. Classify the change as additive, destructive, or data-transforming.
2. Design expand/contract rollout and mixed-version compatibility.
3. Inspect query plans, index build strategy and lock behavior.
4. Implement chunked, resumable backfill with checkpoints.
5. Test forward and rollback on production-sized representative data.
6. Define monitoring, abort thresholds and recovery steps.
7. Remove deprecated columns only after all consumers have migrated.

## 5. Evidence required

Migration plan, production-size timing/lock evidence, rollback or forward-recovery test, backfill metrics and deploy sequencing.

## 6. Anti-patterns

- **REJECT:** rename/drop column in the same deploy that removes old code paths.
- **REJECT:** a single unbounded backfill transaction.
- **REJECT:** assuming down migration is safe after irreversible data loss.
- **REJECT:** deploying schema changes without mixed-version compatibility analysis.

## 7. References

- [Backend baseline](../../../knowledge/backend-baseline.md)
- [Production readiness](../../../knowledge/production-readiness.md)
