---
name: state-management
version: 2.0.0
description: Manage client, URL, and server-cache state deterministically without race conditions or stale authorization state.
applies_to: [frontend, ui]
triggers:
  - adding global or shared client state
  - implementing optimistic updates or server cache invalidation
  - syncing state with URL search params
requires_gate: gates/pre-merge/tests-unit-integration
resources: []
scripts: []
---

## 1. When to use / when not to use

Use when managing shared client state, server-query caches, URL state, or optimistic mutations. Do not duplicate server truth in ad-hoc local stores.

## 2. Non-negotiables

- Keep server data in a dedicated query cache with explicit invalidation, request deduplication, and AbortController cancellation.
- Store shareable filters, pagination cursors, and tabs in URL state validated against an allowlist schema.
- Clear all user/tenant-scoped client caches immediately on logout, session expiry, or tenant switch.
- Roll back optimistic UI updates cleanly on mutation failure and surface actionable error feedback.

## 3. Rejection criteria

Fail the task if stale tenant/user state survives logout, race conditions overwrite newer fetches, optimistic updates lack rollback, or tests do not cover failure/abort paths.

## 4. Step-by-step procedure

1. Classify each piece of state as URL, server-cache, local UI, or ephemeral form state.
2. Bind query keys explicitly to `tenantId` and `userId`.
3. Cancel in-flight requests on unmount or parameter change via `AbortController`.
4. Implement rollback and retry controls on mutations.
5. Run `gates/pre-merge/tests-unit-integration` and attach evidence.

## 5. Evidence required

Unit/integration tests proving race-condition safety, cache clearing on tenant/session change, optimistic rollback, and passing `gates/pre-merge/tests-unit-integration` JSON output.

## 6. Anti-patterns

- **REJECT:** Storing auth tokens or sensitive PII in unencrypted `localStorage` or global `window` objects.
- **REJECT:** Unbounded `useEffect` fetch loops missing abort/cancellation.
- **REJECT:** Cache keys omitting `tenantId`, risking cross-tenant UI flash.

## 7. References

- [Frontend baseline](../../../knowledge/frontend-baseline.md)
- [Web security baseline](../../../knowledge/web-security-baseline.md)

