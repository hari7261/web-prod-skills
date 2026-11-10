---
name: performance-budget
version: 2.0.0
description: Enforce per-route JS/asset bundle budgets and Core Web Vitals targets before merge.
applies_to: [frontend, performance]
triggers:
  - adding frontend dependencies
  - modifying routes, layouts, or media loading
  - changing bundler or code-splitting configuration
requires_gate: gates/pre-commit/bundle-budget
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever adding frontend packages, changing routes, or modifying images/fonts/scripts. Do not ship heavy client libraries without code-splitting and budget verification.

## 2. Non-negotiables

- Keep per-route client JS <= 250 KB and total initial JS within `gates/pre-commit/bundle-budget/config.yaml` thresholds.
- Block PRs that regress route bundle size by more than `max_regression_pct` (10%) without explicit justification.
- Lazy-load non-critical routes, charts, editors, and modals; eliminate unused polyfills and barrel-import bloat.
- Target p75 Core Web Vitals: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 (explicitly size media to avoid layout shift).

## 3. Rejection criteria

Fail the task if a route bundle exceeds budget, bundle regression exceeds 10%, unoptimized full-library imports are added, or `gates/pre-commit/bundle-budget` fails.

## 4. Step-by-step procedure

1. Audit bundle impact before adding any client-side dependency.
2. Code-split heavy interactive modules and optimize images/fonts with explicit dimensions.
3. Generate `bundle-report.json` or production build artifacts.
4. Run `gates/pre-commit/bundle-budget` and verify zero budget/regression findings.

## 5. Evidence required

Passing JSON output from `gates/pre-commit/bundle-budget` and post-deploy Core Web Vitals telemetry.

## 6. Anti-patterns

- **REJECT:** Importing an entire icon or utility library (`import * as Icons`) into the root bundle.
- **REJECT:** Shipping un-dimensioned images or late-injected banners causing CLS > 0.1.

## 7. References

- [Frontend baseline](../../../knowledge/frontend-baseline.md)
- [Bundle budget gate](../../../gates/pre-commit/bundle-budget/README.md)
