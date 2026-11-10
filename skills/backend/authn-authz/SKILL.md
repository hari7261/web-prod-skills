---
name: authn-authz
version: 2.0.0
description: Enforce server-side authentication, resource-level authorization, and fail-closed access control on every route.
applies_to: [backend, api, security]
triggers:
  - adding or changing a server route or resolver
  - implementing login, session, JWT, or API key checks
  - authorizing access to resources or admin actions
requires_gate: gates/pre-merge/route-authz
resources: []
scripts: []
---

## 1. When to use / when not to use

Use on every backend HTTP route, GraphQL/tRPC resolver, WebSocket handshake, and background job acting on user resources.

## 2. Non-negotiables

- Default-deny: every route requires explicit authentication and authorization unless documented with a reasoned exemption (`WEB-PROD-AUTHZ-EXEMPT: <reason>`).
- Derive user and tenant identity strictly from verified server session/JWT/API-key claims, never from request body/query/client headers.
- Enforce object-level authorization (prevent BOLA/IDOR) on every resource fetch/update/delete.
- Use HttpOnly, Secure, SameSite cookies for browser sessions and enforce token expiration + revocation.

## 3. Rejection criteria

Fail the task if any new/changed route lacks server-side authn + authz, trusts client-supplied `userId`/`role`, skips object-level ownership checks, or fails `gates/pre-merge/route-authz`.

## 4. Step-by-step procedure

1. Attach `requireAuth` middleware before route business logic (`templates/backend-service/authz-middleware.ts`).
2. Verify explicit permission AND resource/tenant ownership (`authorize(ctx, perm, resourceTenantId)`).
3. Add negative integration tests for unauthenticated (`401`), unauthorized role (`403`), and cross-tenant ID (`403`/`404`).
4. Run `gates/pre-merge/route-authz` and attach JSON output.

## 5. Evidence required

Passing `gates/pre-merge/route-authz` JSON output plus runtime tests proving 401/403 enforcement across roles and tenants.

## 6. Anti-patterns

- **REJECT:** Hiding buttons in React without enforcing permissions on the API route.
- **REJECT:** `WHERE id = $1` without scoping by `tenant_id` / `owner_id`.
- **REJECT:** Accepting `x-user-id` or `req.body.role` from untrusted callers.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [Route authz gate](../../../gates/pre-merge/route-authz/README.md)
