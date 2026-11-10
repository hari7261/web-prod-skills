# pre-merge/api-contract-diff

## Production-readiness items enforced
- 7. Contract stability

## Inputs
- `openapi.base.json`, `openapi.json`, and `CHANGELOG.md`.

## Pass criteria
- Zero unversioned breaking changes; any removed endpoint/field or incompatible type change increments the major API version and is documented in `CHANGELOG.md`.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/api-contract-diff/run.mjs
```
