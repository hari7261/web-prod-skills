---
name: input-validation
version: 2.0.0
description: Validate and sanitize every request at the server trust boundary before use.
applies_to: [backend, api]
triggers:
  - adding or changing an HTTP endpoint
  - parsing request body/query/params/headers
  - consuming webhook payloads
requires_gate: gates/pre-merge/input-validation
resources: [resources/validation-patterns.md]
scripts: [scripts/check-validation.mjs]
---

## 1. When to use / when not to use

Use for every HTTP endpoint, GraphQL/tRPC resolver, webhook consumer, and queue message handler. Never rely on browser-side validation alone.

## 2. Non-negotiables

- Validate `Content-Type` and enforce byte-size limits before parsing bodies.
- Validate body, query, path params, and headers against strict schemas that reject unknown fields (`additionalProperties: false` / `.strict()`).
- Bound string lengths, array sizes, numeric ranges, nesting depth, and pagination limits.
- Normalize strings (trim, NFC, lowercase email) only after structural validation.
- Return `400`/`422` with deterministic error codes; never leak parser internals.

## 3. Rejection criteria

Fail the task if handlers rely on truthiness (`if (req.body.email)`), spread raw request objects into DB writes, accept unknown fields, or fail `gates/pre-merge/input-validation`.

## 4. Step-by-step procedure

1. Review `resources/validation-patterns.md` and `templates/backend-service/validation.ts`.
2. Define strict schemas for params, query, headers, and body with explicit size/length bounds.
3. Enforce body size and `Content-Type` limits at middleware level.
4. Write negative tests for empty, null, oversized, unicode, malformed, and unknown-field inputs.
5. Run `scripts/check-validation.mjs` and `gates/pre-merge/input-validation`.

## 5. Evidence required

Passing JSON output from `gates/pre-merge/input-validation` plus negative boundary test results.

## 6. Anti-patterns

- **REJECT:** `if (req.body.email)` truthiness validation.
- **REJECT:** `await db.users.create({ data: req.body })` mass assignment.
- **REJECT:** Unbounded arrays or strings.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Backend baseline](../../../knowledge/backend-baseline.md)
