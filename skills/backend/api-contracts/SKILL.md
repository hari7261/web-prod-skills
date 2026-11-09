---
name: api-contracts
version: 1.0.0
description: Maintain stable, validated and reviewable web API contracts.
applies_to: [backend, api]
triggers:
  - adding or changing API endpoints
  - changing request/response schemas
  - changing pagination, errors or API versioning
requires_gate: gates/pre-merge/api-contract
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for HTTP APIs, webhook contracts and externally consumed service interfaces.

## 2. Non-negotiables

- Define request and response schemas explicitly.
- Keep error shapes stable and avoid leaking internal details.
- Reject unknown request fields and bound payloads.
- Version breaking changes and publish migration guidance.
- Use cursor pagination for large or mutable datasets where appropriate.
- Generate and review API schema diffs in CI.

## 3. Rejection criteria

Reject undocumented breaking changes, unbounded pagination, inconsistent error contracts or schemas that diverge from runtime behavior.

## 4. Step-by-step procedure

1. Update the source API schema.
2. Add compatibility and negative tests.
3. Generate the schema diff against the default branch.
4. Classify additive, behavior-changing and breaking changes.
5. Version breaking changes and document client migration.
6. Run contract and compatibility tests.

## 5. Evidence required

Schema diff, compatibility test output, changelog entry and consumer migration plan for breaking changes.

## 6. Anti-patterns

- **REJECT:** silently changing field meaning or nullability.
- **REJECT:** returning raw exception messages.
- **REJECT:** offset pagination on unbounded high-churn datasets without analysis.

## 7. References

- [Backend baseline](../../../knowledge/backend-baseline.md)
- [Production readiness](../../../knowledge/production-readiness.md)
