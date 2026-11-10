# post-deploy/web-vitals-check

## Production-readiness items enforced
- 1. Correctness
- 4. Observability

## Inputs
- `web-vitals-report.json`.

## Pass criteria
- LCP <= 2500 ms, INP <= 200 ms, CLS <= 0.1 at p75.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/post-deploy/web-vitals-check/run.mjs
```
