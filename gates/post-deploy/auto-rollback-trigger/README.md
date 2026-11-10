# post-deploy/auto-rollback-trigger

## Production-readiness items enforced
- 9. Rollback
- 10. Docs

## Inputs
- `post-deploy-status.json`.

## Pass criteria
- Either deployment is healthy with configured rollback hook, or on failure rollback was executed and an incident link is recorded.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/post-deploy/auto-rollback-trigger/run.mjs
```

