---
name: llm-output-safety
version: 1.0.0
description: Treat model output as untrusted and constrain its use in web applications.
applies_to: [ai, backend, frontend]
triggers:
  - rendering model-generated content
  - using model output to trigger tools or actions
  - parsing structured model responses
requires_gate: gates/pre-merge/llm-output-safety
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for all model output, including streamed tokens, tool arguments, summaries, classifications, generated code, and retrieved-content synthesis.

## 2. Non-negotiables

- Treat output as attacker-controlled data, never as policy or executable instructions.
- Parse against strict schemas; reject unknown fields and invalid enum values.
- Authorize every consequential action independently on the server.
- Encode output for its final context; sanitize explicitly permitted rich HTML.
- Never pass model text directly to SQL, shell, eval, filesystem paths, or privileged APIs.
- Bound output size, token count, tool calls, recursion, time and spend.
- Do not expose hidden reasoning, credentials, internal prompts or sensitive context.

## 3. Rejection criteria

Reject direct execution, unsafe HTML insertion, unvalidated tool arguments, model-selected authorization scope, unbounded agent loops, and any design where a refusal or safety classifier is the only access-control layer.

## 4. Step-by-step procedure

1. Identify each output sink and the damage a malformed response could cause.
2. Define a strict schema and fail-closed parsing behavior.
3. Add context-specific encoding or allowlist sanitization.
4. Put authorization, quotas and business invariants outside the model.
5. Add adversarial cases: prompt injection, malformed JSON, extra keys, oversized values and refusal bypass.
6. Instrument model/prompt version, validation failures, tool decisions and cost without logging sensitive content.
7. Run evals and attach the result for the exact prompt/model version.

## 5. Evidence required

Schema definitions, sink review, negative tests, eval report and trace evidence. Static markers alone do not establish safe behavior.

## 6. Anti-patterns

- **REJECT:** `dangerouslySetInnerHTML` with raw model text.
- **REJECT:** model output used as SQL, shell command, URL destination or filesystem path.
- **REJECT:** trusting model claims that the user is authorized.
- **REJECT:** unbounded tool-call loops or autonomous retries.

## 7. References

- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)
- [Web security baseline](../../../knowledge/web-security-baseline.md)
