# post-deploy/error-rate-vs-baseline

## Production-readiness items enforced
- 3. Reliability
- 4. Observability

## Inputs
- `error-rate-report.json`.

## Pass criteria
- `currentErrorRatePct <= baselineErrorRatePct + max_delta_pct` (0.5%) over at least `min_observation_minutes` (10 min).

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/post-deploy/error-rate-vs-baseline/run.mjs
```

