# pre-merge/route-authz

## Production-readiness items enforced
- 2. Security

## Inputs
- Changed or tracked route/controller files (`.js`, `.ts`, `.mjs`, `.py`, `.go`).

## Pass criteria
- Every route file includes recognized authentication and authorization/tenant-isolation controls or a reasoned `WEB-PROD-AUTHZ-EXEMPT: <reason>` comment.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/route-authz/run.mjs
```
