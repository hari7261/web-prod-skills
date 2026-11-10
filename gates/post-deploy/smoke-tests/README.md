# post-deploy/smoke-tests

## Production-readiness items enforced
- 1. Correctness
- 3. Reliability

## Inputs
- `smoke-report.json` or `WEB_PROD_SMOKE_URL` + `smoke-targets.json`.

## Pass criteria
- All critical-path smoke checks pass within timeout.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/post-deploy/smoke-tests/run.mjs
```

