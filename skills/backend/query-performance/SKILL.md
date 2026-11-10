---
name: query-performance
version: 2.0.0
description: Eliminate N+1 queries, enforce statement timeouts, bound pools, and index critical query paths.
applies_to: [backend, database, performance]
triggers:
  - writing ORM or SQL queries inside loops or resolvers
  - adding new query filters, joins, or aggregations
  - configuring database connection pools
requires_gate: gates/pre-merge/observability-presence
resources: []
scripts: []
---

## 1. When to use / when not to use

Use when adding or modifying database queries, ORM relations, GraphQL resolvers, or pool settings.

## 2. Non-negotiables

- Eliminate N+1 query patterns with batched `IN (...)` queries, joins, or DataLoader per request.
- Enforce bounded DB connection pools, acquire timeouts, and query `statement_timeout`.
- Select only required columns; avoid `SELECT *` on wide or sensitive tables.
- Verify `EXPLAIN ANALYZE` on new high-volume queries to ensure index usage (no unintended sequential scans).
- Emit DB query duration metrics and trace spans without logging raw query PII.

## 3. Rejection criteria

Fail the task if queries execute inside per-item loops, lack timeouts/pool bounds, return unbounded rows, or omit DB telemetry.

## 4. Step-by-step procedure

1. Replace per-item loop queries with batched queries or explicit joins.
2. Verify composite indexes match `WHERE (tenant_id, ...)` + `ORDER BY` clauses.
3. Set explicit pool size and query timeout bounds.
4. Instrument DB calls with metrics and trace spans, then run `gates/pre-merge/observability-presence`.

## 5. Evidence required

`EXPLAIN ANALYZE` summary for new critical queries, query-count assertion tests, and passing `gates/pre-merge/observability-presence` output.

## 6. Anti-patterns

- **REJECT:** `for (const order of orders) { await db.items.findMany({ where: { orderId: order.id } }); }`.
- **REJECT:** Unbounded `Promise.all(ids.map(id => db.query(...)))` exhausting DB connections.

## 7. References

- [Backend baseline](../../../knowledge/backend-baseline.md)
- [Reliability baseline](../../../knowledge/reliability-baseline.md)

