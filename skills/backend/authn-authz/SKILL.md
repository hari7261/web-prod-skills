---
name: authn-authz
version: 1.0.0
description: Enforce server-side authentication and resource-level authorization on every route.
applies_to: [backend, api]
triggers:
  - adding or changing a route
  - accessing tenant-scoped resources
  - changing authentication or authorization
requires_gate: gates/pre-merge/route-authz
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every server route and every resource access. Public endpoints still require an explicit documented public-access decision.

## 2. Non-negotiables

- Authenticate on the server; never trust identity claims supplied only by the client.
- Authorize the requested action against the specific resource on every request.
- Derive tenant scope from trusted identity context and include it in data access.
- Deny by default and avoid IDOR/BOLA.
- Test cross-user and cross-tenant access attempts.

## 3. Rejection criteria

Fail if a changed route lacks authentication, relies on frontend route guards, authorizes only by role without resource scope where required, or fetches tenant data before enforcing tenant isolation.

## 4. Step-by-step procedure

1. Classify the route as public or authenticated.
2. Resolve identity using trusted server middleware.
3. Resolve the resource within the authenticated tenant boundary.
4. Check action-level permission on that resource.
5. Apply tenant constraints in database queries, not only post-fetch checks.
6. Add allow/deny tests, including cross-tenant identifiers.
7. Run the required gate and attach JSON evidence.

## 5. Evidence required

The gate checks for recognizable authentication and authorization/tenant-scope markers. Integration tests must prove policy behavior; markers alone do not establish correctness.

## 6. Anti-patterns

- **REJECT:** frontend-only auth checks.
- **REJECT:** queries without tenant scope.
- **REJECT:** trusting userId or tenantId from request JSON.
- **REJECT:** hidden UI controls as authorization.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Production readiness](../../../knowledge/production-readiness.md)
- [Security baseline](../../../knowledge/web-security-baseline.md)
