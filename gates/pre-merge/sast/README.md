# pre-merge/sast

## Production-readiness items enforced
- 2. Security

## Inputs
- Source files and optional `sast-report.json`.

## Pass criteria
- Zero high/critical SAST findings (`eval`, dynamic `Function`, shell `exec` with interpolation, SQL string interpolation, disabled TLS verification, wildcard credentialed CORS, empty catch blocks).

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/sast/run.mjs
```
