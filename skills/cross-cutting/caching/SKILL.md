---
name: caching
version: 2.0.0
description: Implement tenant-safe HTTP, CDN, and Redis caching with explicit TTLs, Vary headers, and stampede protection.
applies_to: [backend, frontend, performance]
triggers:
  - adding Cache-Control headers, CDN caching, or Redis/memory caches
  - caching authenticated or personalized API responses
requires_gate: gates/pre-merge/tests-unit-integration
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever configuring HTTP cache headers, edge/CDN caching, or application-level Redis/in-memory caches.

## 2. Non-negotiables

- Never cache authenticated, personalized, or tenant-scoped responses in shared public CDN caches (`Cache-Control: private, no-store` for sensitive auth responses).
- Include `tenantId`, `userId` (if user-specific), and schema version in every application cache key.
- Set explicit TTLs with jitter, bounded cache memory limits, and stampede protection (singleflight / lock) on hot keys.
- Never let a Redis/cache outage break core requests—fall back cleanly to the primary source with circuit breaking.

## 3. Rejection criteria

Fail the task if authenticated responses use `Cache-Control: public`, cache keys lack `tenantId`, caches have infinite TTL/size, or tests omit cache invalidation/outage fallback.

## 4. Step-by-step procedure

1. Classify data sensitivity (`public immutable`, `private user/tenant`, `no-store`).
2. Namespace keys as `v1:tenant:{tenantId}:{entity}:{id}` with jittered TTL.
3. Add explicit invalidation or short TTL + stale-while-revalidate rules.
4. Test cross-tenant isolation, invalidation on write, and cache-down fallback.
5. Run `gates/pre-merge/tests-unit-integration`.

## 5. Evidence required

Cache isolation, invalidation, and Redis-down fallback tests plus passing `gates/pre-merge/tests-unit-integration` output.

## 6. Anti-patterns

- **REJECT:** Setting `s-maxage=3600` on `/api/me` or tenant-specific endpoints (cache poisoning / data leak).
- **REJECT:** Caching `req.path` without `tenantId` in multi-tenant apps.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [Reliability baseline](../../../knowledge/reliability-baseline.md)

