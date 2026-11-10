---
name: forms-and-validation
version: 2.0.0
description: Build accessible forms with shared schema constraints, pending-submit guards, and server-authoritative validation.
applies_to: [frontend, ui]
triggers:
  - creating or modifying user input forms
  - adding client-side form validation or multi-step flows
  - submitting mutations from browser UI
requires_gate: gates/pre-merge/input-validation
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for all browser forms, search inputs, settings screens, and multi-step wizards. Never treat client validation as a security boundary.

## 2. Non-negotiables

- Enforce identical strict schema bounds on the server (`gates/pre-merge/input-validation`); client validation is UX only.
- Disable duplicate submissions while pending and use idempotency keys on financial or state-changing mutations.
- Associate every field with `<label>`, `aria-invalid`, and `aria-describedby` error summaries announced to screen readers.
- Preserve user input on transient network errors and map server field errors back to exact controls.

## 3. Rejection criteria

Fail the task if double-clicks trigger duplicate mutations, server validation is omitted, errors are invisible to assistive tech, or sensitive fields lack `autocomplete`/masking discipline.

## 4. Step-by-step procedure

1. Define the canonical schema and field bounds (`min`, `max`, format).
2. Wire accessible labels, inline errors, and focus-on-first-error on submit failure.
3. Guard submission state (`isSubmitting`) and include an idempotency token where applicable.
4. Test malformed, empty, oversized, and double-submit cases.
5. Run `gates/pre-merge/input-validation` and `gates/pre-merge/accessibility`.

## 5. Evidence required

Passing `gates/pre-merge/input-validation` and `gates/pre-merge/accessibility` outputs plus form submission and duplicate-click tests.

## 6. Anti-patterns

- **REJECT:** Client-side regex validation without matching server-side schema enforcement.
- **REJECT:** Silent submit failures that reset user-entered form data.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Frontend baseline](../../../knowledge/frontend-baseline.md)

