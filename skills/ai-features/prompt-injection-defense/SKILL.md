---
name: prompt-injection-defense
version: 2.0.0
description: Defend AI endpoints and RAG pipelines against direct and indirect prompt injection.
applies_to: [ai, security]
triggers:
  - passing user input, web pages, emails, or RAG documents into LLM context
  - connecting an LLM to tools or external data sources
requires_gate: gates/pre-merge/prompt-evals
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever an LLM processes user text, uploaded documents, retrieved RAG chunks, or third-party data—especially when tools or private data are accessible.

## 2. Non-negotiables

- Separate trusted system instructions from untrusted user/retrieved data using explicit structural delimiters or separate message roles.
- Enforce least-privilege tool access and server-side authorization; never rely on prompt phrasing alone for security.
- Block markdown image/link exfiltration to untrusted external domains when rendering LLM responses.
- Run adversarial injection golden sets (`evals/golden-sets/prompt-injection/cases.jsonl`) on every prompt/model/retrieval change.

## 3. Rejection criteria

Fail the task if retrieved content can trigger unauthorized tools, system secrets can be extracted, or `gates/pre-merge/prompt-evals` fails the `prompt-injection` threshold (`1.00`).

## 4. Step-by-step procedure

1. Isolate untrusted user and RAG content in clearly delimited data blocks.
2. Restrict tool scopes to explicit read/write permissions owned by the authenticated session.
3. Require user confirmation or deterministic policy checks for state-changing or sensitive tool invocations.
4. Run `gates/pre-merge/prompt-evals` against `evals/golden-sets/prompt-injection/`.

## 5. Evidence required

Passing `gates/pre-merge/prompt-evals` JSON output showing `1.00` pass rate on `prompt-injection`.

## 6. Anti-patterns

- **REJECT:** Concatenating untrusted RAG snippets into the `system` message.
- **REJECT:** Allowing a model to trigger destructive/admin tools based solely on prompt rules.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [Prompt evals gate](../../../gates/pre-merge/prompt-evals/README.md)

