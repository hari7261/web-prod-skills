# pre-commit/bundle-budget

## Production-readiness items enforced
- 1. Correctness
- 6. Cost

## Inputs
- `bundle-report.json` or built JS bundles in `dist/`, `build/`, `.next/static/`.

## Pass criteria
- Per-route JS <= `max_route_js_kb` (250 KB), total JS <= `max_total_js_kb` (800 KB), regression <= `max_regression_pct` (10%).

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-commit/bundle-budget/run.mjs
```
