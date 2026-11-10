# pre-deploy/env-config-diff

## Production-readiness items enforced
- 8. Deployability

## Inputs
- `env-diff.json` (comparing staging/prod config keys and values).

## Pass criteria
- Env/config diff is explicitly reviewed (`reviewed: true`), contains zero unapproved prod key removals, and embeds zero literal secret values.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-deploy/env-config-diff/run.mjs
```
