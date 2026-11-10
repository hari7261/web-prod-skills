---
name: api-contract-first
version: 2.0.0
description: Design and evolve versioned API contracts with explicit error schemas and backward-compatibility checks.
applies_to: [backend, api]
triggers:
  - adding or changing REST, GraphQL, or tRPC endpoints
  - changing request or response schemas
  - deprecating or removing API fields
requires_gate: gates/pre-merge/api-contract-diff
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every public or internal web API contract change. Do not ship unversioned breaking changes to existing consumers.

## 2. Non-negotiables

- Define OpenAPI/GraphQL/schema contracts before implementing route handlers.
- Use additive evolution by default; breaking changes require a major version bump (`/v2/`) and `CHANGELOG.md` entry.
- Standardize error payloads (`code`, `message`, `requestId`, optional `details`) without leaking stack traces.
- Document deprecation headers (`Deprecation`, `Sunset`) before removing fields or routes.

## 3. Rejection criteria

Fail the task if an endpoint or required response field is removed/retyped without a major version bump and changelog entry, or if `gates/pre-merge/api-contract-diff` fails.

## 4. Step-by-step procedure

1. Update the OpenAPI/GraphQL schema first (`openapi.json`).
2. Compare against `openapi.base.json` using `scripts/contract-diff.mjs`.
3. If breaking changes exist, bump major API version and update `CHANGELOG.md`.
4. Implement handler conforming strictly to the contract and add contract tests.
5. Run `gates/pre-merge/api-contract-diff` and attach JSON output.

## 5. Evidence required

Contract diff output from `gates/pre-merge/api-contract-diff`, contract tests, and updated `CHANGELOG.md` when breaking.

## 6. Anti-patterns

- **REJECT:** Silently renaming JSON response keys or changing field types in place.
- **REJECT:** Returning raw database rows or framework exception objects as API responses.

## 7. References

- [Backend baseline](../../../knowledge/backend-baseline.md)
- [API contract diff gate](../../../gates/pre-merge/api-contract-diff/README.md)
