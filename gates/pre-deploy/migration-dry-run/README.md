# pre-deploy/migration-dry-run

## Production-readiness items enforced
- 5. Data safety

## Inputs
- SQL migration files (`*.up.sql`) and `migration-dry-run.json`.

## Pass criteria
- Dry-run applies cleanly (`applied: true`), lock-time estimate <= `max_lock_ms` (2000 ms), and SQL avoids blocking index/lock hazards.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-deploy/migration-dry-run/run.mjs
```

