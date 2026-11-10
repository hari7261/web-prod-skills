---
name: prompt-management
version: 2.0.0
description: Store production prompts as versioned artifacts and gate every prompt change on evals.
applies_to: [ai, backend]
triggers:
  - creating or editing a production prompt
  - changing model ID, temperature, or system instructions
requires_gate: gates/pre-merge/prompt-hygiene
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever creating or updating prompts, system instructions, or model parameters.

## 2. Non-negotiables

- Store prompts in versioned YAML/JSON artifacts (`id`, `version`, `model`, `max_tokens`, `output_schema`), never inline strings in code.
- Treat prompt changes like code releases: review diffs, run `evals/runners/run-suite.mjs`, and retain instant rollback to the prior version.
- Log active `prompt_id` + `prompt_version` on every inference trace.

## 3. Rejection criteria

Fail the task if prompts are hardcoded inline in application source, prompt files omit required metadata, or `gates/pre-merge/prompt-hygiene` fails.

## 4. Step-by-step procedure

1. Create a new versioned prompt file based on `templates/ai-endpoint/prompt.v1.yaml`.
2. Load the prompt via versioned loader in application code.
3. Run `gates/pre-merge/prompt-hygiene` and `gates/pre-merge/prompt-evals`.
4. Attach eval comparison against `evals/baselines/v2.0.0.json`.

## 5. Evidence required

Passing `gates/pre-merge/prompt-hygiene` and `gates/pre-merge/prompt-evals` JSON outputs.

## 6. Anti-patterns

- **REJECT:** `const systemPrompt = "You are a helpful assistant..."` inside a route handler.
- **REJECT:** Editing a prompt in place without incrementing version or running evals.

## 7. References

- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)
- [Prompt hygiene gate](../../../gates/pre-merge/prompt-hygiene/README.md)

