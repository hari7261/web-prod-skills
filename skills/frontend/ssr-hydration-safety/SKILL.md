---
name: ssr-hydration-safety
version: 2.0.0
description: Prevent SSR/CSR hydration mismatches, cross-request state leaks, and unsafe client-only globals during server rendering.
applies_to: [frontend, ssr]
triggers:
  - implementing SSR, RSC, or streaming HTML rendering
  - accessing window, document, localStorage, Date.now, or Math.random in shared components
  - configuring server-rendered caching or cookies
requires_gate: gates/pre-merge/tests-unit-integration
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for all SSR, SSG, streaming, and hybrid server/client components (Next.js, Nuxt, SvelteKit, Remix).

## 2. Non-negotiables

- Never read `window`, `document`, or `localStorage` during initial render; defer client-only logic to post-mount effects or dynamic client boundaries.
- Never share mutable module-level singletons across SSR requests (prevents cross-user data/auth leakage).
- Keep initial server and client render output deterministic (no unseeded `Math.random()`, `Date.now()`, or locale-dependent formatting mismatches without explicit timezone/locale props).
- Never serialize secrets or unrequested private fields into `__NEXT_DATA__` / hydration payloads.

## 3. Rejection criteria

Fail the task if SSR throws `window is not defined`, causes React/Vue/Svelte hydration mismatch warnings, leaks module-level state across requests, or embeds secrets in hydration JSON.

## 4. Step-by-step procedure

1. Keep request state strictly scoped to per-request context/headers.
2. Pass explicit server-resolved locale, timezone, and timestamp props when rendering formatted values.
3. Guard browser-only APIs behind mount hooks or client-only dynamic imports.
4. Add SSR render + hydration integration tests and run `gates/pre-merge/tests-unit-integration`.

## 5. Evidence required

SSR + hydration tests with zero mismatch warnings, payload inspection confirming no leaked secrets, and passing `gates/pre-merge/tests-unit-integration` output.

## 6. Anti-patterns

- **REJECT:** Module-level `let currentUser = null` mutated during SSR requests.
- **REJECT:** Rendering `new Date().toLocaleString()` without fixed timezone/locale on server vs client.

## 7. References

- [Frontend baseline](../../../knowledge/frontend-baseline.md)
- [Web security baseline](../../../knowledge/web-security-baseline.md)
