---
name: input-validation
version: 1.0.0
description: Validate every request at the server trust boundary using strict schemas.
applies_to: [backend, api]
triggers:
  - adding or changing an HTTP endpoint
  - parsing request body/query/params/headers
  - consuming webhook payloads
requires_gate: gates/pre-merge/input-validation
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every HTTP endpoint, webhook consumer, and externally supplied message. Do not use client-only validation as a substitute for server validation.

## 2. Non-negotiables

- Validate content type and payload size before parsing.
- Use an explicit schema; reject unknown fields.
- Bound strings, arrays, numeric ranges, nesting, and pagination.
- Normalize only after validation; preserve security-relevant distinctions.
- Return stable client errors without leaking internals.
- Validate again at downstream trust boundaries.

## 3. Rejection criteria

Fail the task if it relies on truthiness checks, accepts arbitrary object keys, has unbounded input, trusts client validation, or silently coerces malformed values.

## 4. Step-by-step procedure

1. Identify all untrusted sources and maximum payload sizes.
2. Define strict request schemas and content-type requirements.
3. Enforce limits before expensive parsing or processing.
4. Validate path, query, headers, and body independently.
5. Bind authorization to validated identifiers and tenant context.
6. Add malformed, empty, null, oversized, unicode, and unknown-field tests.
7. Run the required gate and attach its JSON output.

## 5. Evidence required

The gate checks for schema-validation evidence in changed handler files. Tests must demonstrate rejection of malformed and unknown fields. Static markers alone are not proof of runtime correctness.

## 6. Anti-patterns

- **REJECT:** `if (req.body.email)` as validation.
- **REJECT:** spreading arbitrary request objects into database writes.
- **REJECT:** unbounded arrays, strings, uploads, or pagination.
- **REJECT:** trusting browser validation.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Production readiness](../../../knowledge/production-readiness.md)
- [Backend baseline](../../../knowledge/backend-baseline.md)
