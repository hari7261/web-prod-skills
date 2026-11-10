---
name: db-migrations
version: 2.0.0
description: Execute zero-downtime, expand-and-contract database migrations with lock budgets and tested rollbacks.
applies_to: [backend, database, delivery]
triggers:
  - modifying database tables, columns, indexes, or constraints
  - writing data backfills
requires_gate: gates/pre-deploy/migration-dry-run
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every SQL/NoSQL schema change, index creation, constraint addition, or production data backfill.

## 2. Non-negotiables

- Every forward migration (`.up.sql`) has a paired, tested rollback (`.down.sql`).
- Set explicit `lock_timeout` and `statement_timeout`; create indexes `CONCURRENTLY` on live tables.
- Use expand-and-contract across deploys for column renames, drops, or `NOT NULL` enforcement.
- Run backfills in bounded, idempotent batches with throttling; never update millions of rows in a single transaction.

## 3. Rejection criteria

Fail the task if a migration lacks a tested down-migration, runs blocking `CREATE INDEX` or table rewrites without lock bounds, or fails `gates/pre-deploy/migration-dry-run` or `gates/pre-deploy/migration-rollback-present`.

## 4. Step-by-step procedure

1. Author `.up.sql`, `.down.sql`, and backfill plan using `templates/migration/`.
2. Dry-run both forward and rollback migrations against a production-shaped schema.
3. Measure lock duration and ensure zero breaking skew with running N-1 app instances.
4. Run `gates/pre-deploy/migration-dry-run` and `gates/pre-deploy/migration-rollback-present`.

## 5. Evidence required

Dry-run logs, lock-time measurements, tested down-migration proof, and passing JSON outputs from both migration gates.

## 6. Anti-patterns

- **REJECT:** Dropping or renaming a column currently read by live application containers in a single deploy.
- **REJECT:** Unbounded `UPDATE huge_table SET x = y` in a migration script.

## 7. References

- [Backend baseline](../../../knowledge/backend-baseline.md)
- [Migration dry-run gate](../../../gates/pre-deploy/migration-dry-run/README.md)
- [Migration rollback gate](../../../gates/pre-deploy/migration-rollback-present/README.md)

