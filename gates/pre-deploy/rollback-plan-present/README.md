# pre-deploy/rollback-plan-present

## Production-readiness items enforced
- 9. Rollback

## Inputs
- `rollback-plan.json` or `deploy-plan.yaml`.

## Pass criteria
- Deploy rollback procedure is documented with a target release/tag and verified (`tested: true`).

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-deploy/rollback-plan-present/run.mjs
```

