# LLM output safety gate

Blocking evidence-manifest gate. It checks that reviewed safety evidence is present and fresh; it does not execute application-specific sink tests or evals itself.

Set `WEB_PROD_EVIDENCE_FILE` to a JSON manifest with `gate: "gates/pre-merge/llm-output-safety"`, `status: "pass"`, a current ISO `generated_at`, and `checks[]` entries containing `id`, `status: "pass"`, and non-empty `evidence`. Required IDs: output-schema-tests, unsafe-sink-review, tool-authorization-tests, prompt-injection-evals, size-and-cost-bounds. Evidence must be less than seven days old.

Run: `WEB_PROD_EVIDENCE_FILE=report.json node gates/pre-merge/llm-output-safety/run.mjs`. Exit 1 on missing, stale or failing evidence.
