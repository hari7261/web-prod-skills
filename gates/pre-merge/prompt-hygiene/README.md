# pre-merge/prompt-hygiene

## Production-readiness items enforced
- 1. Correctness
- 2. Security

## Inputs
- Application source files and versioned prompt files (`*.prompt.yaml`, `prompt*.yaml`).

## Pass criteria
- Zero inline production system/user prompt templates in application code; versioned prompt files include `id`, `version`, `model`, and `max_tokens`.

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/prompt-hygiene/run.mjs
```

