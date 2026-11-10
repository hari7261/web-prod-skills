# pre-deploy/canary-plan-present

## Production-readiness items enforced
- 8. Deployability

## Inputs
- `deploy-plan.json` or `deploy-plan.yaml`.

## Pass criteria
- Deploy plan declares `canary_percent` (1..25%), `observation_window_minutes` (>= 10), and non-empty `abort_criteria`.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-deploy/canary-plan-present/run.mjs
```

