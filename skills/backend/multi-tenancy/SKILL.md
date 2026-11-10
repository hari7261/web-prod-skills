---
name: multi-tenancy
version: 2.0.0
description: Enforce explicit tenant isolation across database queries, caches, files, queues, and RAG indexes.
applies_to: [backend, database, security]
triggers:
  - storing or querying tenant-owned data
  - caching tenant responses or storing tenant files
  - implementing tenant-scoped RAG retrieval or webhooks
requires_gate: gates/pre-merge/route-authz
resources: []
scripts: []
---

## 1. When to use / when not to use

Use in any multi-tenant web application whenever storing, querying, caching, indexing, or returning customer data.

## 2. Non-negotiables

- Derive `tenantId` exclusively from verified auth context, never from untrusted payload fields unless cross-checked against membership.
- Include `tenant_id` in every database query predicate (or enforce DB Row-Level Security policies), cache key, object-storage prefix, and vector search filter.
- Reject/fail closed if `tenantId` is missing in a tenant-scoped code path.
- Test cross-tenant isolation explicitly in integration tests (Tenant A token requesting Tenant B resource ID must fail).

## 3. Rejection criteria

Fail the task if queries omit `tenant_id`, cache keys collide across tenants, RAG retrieval happens before tenant filtering, or cross-tenant tests are absent.

## 4. Step-by-step procedure

1. Propagate verified `tenantId` through request context, DB repositories, jobs, and telemetry (without high-cardinality metric labels).
2. Add composite indexes `(tenant_id, id)` and RLS policies where supported.
3. Prefix all cache keys and blob paths with `tenantId`.
4. Add automated cross-tenant isolation tests and run `gates/pre-merge/route-authz`.

## 5. Evidence required

Cross-tenant negative integration test results and passing `gates/pre-merge/route-authz` JSON output.

## 6. Anti-patterns

- **REJECT:** `SELECT * FROM invoices WHERE id = $1` without `AND tenant_id = $2`.
- **REJECT:** Filtering RAG chunks by `tenantId` *after* passing them into the LLM context.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [Backend baseline](../../../knowledge/backend-baseline.md)

