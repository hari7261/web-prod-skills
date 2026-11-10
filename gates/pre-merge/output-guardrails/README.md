# pre-merge/output-guardrails

## Production-readiness items enforced
- 2. Security

## Inputs
- AI/LLM handler and rendering files.

## Pass criteria
- LLM output is validated against a schema or sanitized before DOM/SQL/shell/file use.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/output-guardrails/run.mjs
```

