---
name: component-architecture
version: 2.0.0
description: Structure web UI components with strict separation of state, presentation, and server/client boundaries.
applies_to: [frontend, ui]
triggers:
  - creating or refactoring UI components
  - splitting server and client component boundaries
  - building shared design-system primitives
requires_gate: gates/pre-commit/lint-and-typecheck
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever creating or refactoring frontend components or design-system primitives. Do not use for backend-only route modules.

## 2. Non-negotiables

- Keep server data fetching and secrets strictly in server components or API layers; never leak server modules into client bundles.
- Enforce explicit TypeScript prop contracts; prohibit `any` props or unchecked prop spreading onto DOM nodes.
- Keep components single-responsibility (< 250 lines) with deterministic props and controlled/uncontrolled clarity.
- Isolate side effects (`useEffect`) to external synchronization only, with cleanup handlers.

## 3. Rejection criteria

Fail the task if components fetch unauthenticated secrets client-side, spread arbitrary user props onto DOM elements, mix business logic into leaf UI atoms, or fail typecheck/lint.

## 4. Step-by-step procedure

1. Define strict TypeScript props and explicit loading, empty, and error states.
2. Separate pure presentational components from data-fetching containers.
3. Mark client-only interactive boundaries explicitly (`"use client"` where applicable) and minimize client JS footprint.
4. Add unit/component tests covering normal, empty, error, and boundary prop values.
5. Run `gates/pre-commit/lint-and-typecheck` and attach its JSON output.

## 5. Evidence required

Typecheck/lint pass JSON output from `gates/pre-commit/lint-and-typecheck`, component tests, and clean server/client boundary review.

## 6. Anti-patterns

- **REJECT:** `props: any` or `{...props}` blindly forwarding untrusted attributes onto DOM elements.
- **REJECT:** Importing server-only DB/secret utilities inside client components.
- **REJECT:** 600-line god-components handling auth, fetching, formatting, and markup together.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Frontend baseline](../../../knowledge/frontend-baseline.md)

