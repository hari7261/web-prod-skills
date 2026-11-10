# post-deploy/slo-check

## Production-readiness items enforced
- 3. Reliability
- 4. Observability

## Inputs
- `slo-report.json`.

## Pass criteria
- Availability >= `min_availability_pct` (99.9%) and p99 latency <= `max_p99_latency_ms` (400ms).

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/post-deploy/slo-check/run.mjs
```
