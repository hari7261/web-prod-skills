# pre-deploy/production-build

## Production-readiness items enforced
- 8. Deployability

## Inputs
- `build-report.json` or build output artifacts.

## Pass criteria
- Build status is `pass` and a verifiable build artifact hash is recorded.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-deploy/production-build/run.mjs
```

