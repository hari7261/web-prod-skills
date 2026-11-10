---
name: pagination-and-filtering
version: 2.0.0
description: Bound collection endpoints with keyset/cursor pagination, allowlisted sort/filter fields, and deterministic ordering.
applies_to: [backend, api, database]
triggers:
  - adding list or search API endpoints
  - adding sort, filter, or pagination query params
requires_gate: gates/pre-merge/input-validation
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every list, feed, search, or export API returning collections of records.

## 2. Non-negotiables

- Enforce a hard server-side maximum page size (`limit <= 100`) and sensible default (`20`–`50`).
- Prefer cursor/keyset pagination for large or live tables; include an explicit tie-breaker (`ORDER BY created_at DESC, id DESC`).
- Validate `sort`, `order`, and `filter` fields against a strict server allowlist; never interpolate query column names into SQL.
- Return consistent pagination envelope (`items`, `nextCursor`, `hasMore`).

## 3. Rejection criteria

Fail the task if list queries lack `LIMIT`, allow arbitrary `limit=1000000`, sort by unvalidated client column names, or have unstable ordering.

## 4. Step-by-step procedure

1. Define cursor schema, max `limit`, and allowlisted filter/sort fields.
2. Fetch `limit + 1` rows to compute `hasMore` without an expensive `COUNT(*)`.
3. Add matching composite database indexes for the sort + tenant predicate.
4. Test empty results, boundary `limit` (0, 1, 100, 101), invalid cursors, and unknown filter keys.
5. Run `gates/pre-merge/input-validation`.

## 5. Evidence required

Passing `gates/pre-merge/input-validation` JSON output and pagination boundary/stability tests.

## 6. Anti-patterns

- **REJECT:** `SELECT * FROM events WHERE tenant_id = $1` with no `LIMIT`.
- **REJECT:** `ORDER BY ${req.query.sort}` SQL injection vector.

## 7. References

- [Backend baseline](../../../knowledge/backend-baseline.md)
- [Input validation gate](../../../gates/pre-merge/input-validation/README.md)
