# pre-commit/secrets-scan

## Production-readiness items enforced
- 2. Security

## Inputs
- Tracked or changed source files, committed `.env*` files, and client bundle outputs.

## Pass criteria
- Zero secret patterns in source or client bundles, and zero committed `.env` files (`.env.example` / `.env.template` permitted).

## Failure message format
JSON report with `status: "fail"` and `findings` array, plus `[FAIL]` summary on stderr, exiting with code `1`.

## How to run
```sh
node gates/pre-commit/secrets-scan/run.mjs
```
