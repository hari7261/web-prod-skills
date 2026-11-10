# pre-merge/observability-presence

## Production-readiness items enforced
- 4. Observability

## Inputs
- Application source files containing network, database, or LLM calls.

## Pass criteria
- Every new/changed network, DB, or LLM path emits structured logs, metrics, and a trace span.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/observability-presence/run.mjs
```

