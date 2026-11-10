# pre-deploy/migration-rollback-present

## Production-readiness items enforced
- 5. Data safety
- 9. Rollback

## Inputs
- `*.up.sql` / `*.down.sql` migration pairs and `migration-dry-run.json`.

## Pass criteria
- Every `.up.sql` has a non-empty `.down.sql` rollback script and `rollbackTested: true` in dry-run metadata when provided.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-deploy/migration-rollback-present/run.mjs
```
