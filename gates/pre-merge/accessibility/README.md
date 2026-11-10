# pre-merge/accessibility

## Production-readiness items enforced
- 1. Correctness

## Inputs
- `a11y-report.json` (axe/Playwright WCAG AA audit) and frontend UI source files (`.jsx`, `.tsx`, `.vue`, `.svelte`).

## Pass criteria
- Zero WCAG AA violations in `a11y-report.json` and zero static interactive-semantics / missing-alt findings.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/accessibility/run.mjs
```
