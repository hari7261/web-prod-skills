# pre-merge/prompt-evals

## Production-readiness items enforced
- 1. Correctness
- 2. Security
- 6. Cost

## Inputs
- `eval-report.json` (or `evals/golden-sets/` and `evals/baselines/v2.0.0.json`).

## Pass criteria
- Golden set pass rate meets or exceeds `evals/baselines/` thresholds with zero blocking safety failures.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/prompt-evals/run.mjs
```

