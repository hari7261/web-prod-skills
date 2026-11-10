---
name: output-guardrails
version: 2.0.0
description: Validate, constrain, and sanitize untrusted LLM output before any downstream use or rendering.
applies_to: [ai, backend, frontend, security]
triggers:
  - consuming LLM output in backend logic or UI
  - executing tool calls proposed by a model
requires_gate: gates/pre-merge/output-guardrails
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for every LLM response—structured JSON, tool calls, Markdown, summaries, or code suggestions.

## 2. Non-negotiables

- Treat all model output as attacker-controlled untrusted input.
- Parse structured output against strict schemas rejecting unknown fields and invalid enums (`templates/ai-endpoint/output-schema.ts`).
- Enforce server-side authorization and argument validation before executing any model-proposed tool call.
- Never pass LLM output directly to SQL, shell, filesystem paths, `eval`, or unsanitized HTML sinks.

## 3. Rejection criteria

Fail the task if LLM output flows into dangerous sinks without validation/sanitization, tool arguments bypass server authz, or `gates/pre-merge/output-guardrails` fails.

## 4. Step-by-step procedure

1. Define fail-closed output schema with strict bounds and allowlisted enums.
2. Sanitize any user-visible rich text via `templates/frontend-app/safe-html.ts` (`DOMPurify`).
3. Authorize every tool call against the verified user/tenant session, never model claims.
4. Test malformed JSON, extra fields, XSS payloads, and disallowed tool calls.
5. Run `gates/pre-merge/output-guardrails` and `gates/pre-commit/dangerous-html-scan`.

## 5. Evidence required

Passing `gates/pre-merge/output-guardrails` JSON output and negative guardrail unit tests.

## 6. Anti-patterns

- **REJECT:** `eval(llmOutput)` or `db.query(llmOutput)`.
- **REJECT:** Passing model-suggested `tenantId` or `userId` to a privileged tool without session verification.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Output guardrails gate](../../../gates/pre-merge/output-guardrails/README.md)
