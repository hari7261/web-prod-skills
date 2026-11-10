# pre-merge/llm-call-resilience

## Production-readiness items enforced
- 3. Reliability
- 6. Cost

## Inputs
- Backend/AI integration source files invoking LLM or third-party endpoints.

## Pass criteria
- Every LLM/external call declares timeout/signal, bounded retry policy, fallback/degradation path, and token/rate budget (`maxTokens`/`max_tokens`).

## Failure message format
JSON report with `status: "fail"` and `findings`, exiting with code `1`.

## How to run
```sh
node gates/pre-merge/llm-call-resilience/run.mjs
```

