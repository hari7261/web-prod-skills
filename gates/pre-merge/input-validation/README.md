# pre-merge/input-validation

## Production-readiness items enforced
- 2. Security

## Inputs
- Changed or tracked backend handler source files (`.js`, `.ts`, `.mjs`, `.py`, `.go`).

## Pass criteria
- Every route/handler file uses a recognized strict schema validator (`safeParse(`, `validateSchema(`, etc.) or a reasoned `WEB-PROD-VALIDATION-EXEMPT: <reason>` comment.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/input-validation/run.mjs
```
