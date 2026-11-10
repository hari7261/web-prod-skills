# pre-merge/tests-unit-integration

## Production-readiness items enforced
- 1. Correctness

## Inputs
- `test-report.json` (unit + integration results and coverage) and repository test files.

## Pass criteria
- Zero failed tests, coverage >= `min_coverage_pct` (80%), and test files exist for source code.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/tests-unit-integration/run.mjs
```

