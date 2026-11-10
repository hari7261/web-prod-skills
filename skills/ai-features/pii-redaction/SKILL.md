---
name: pii-redaction
version: 2.0.0
description: Minimize and redact PII before sending prompts to external LLM providers or writing AI logs and eval datasets.
applies_to: [ai, security, privacy]
triggers:
  - sending user or customer text to third-party LLM APIs
  - logging AI prompts, completions, or building eval datasets
requires_gate: gates/pre-merge/output-guardrails
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever AI features process emails, names, phone numbers, SSNs, tokens, payment info, or sensitive customer records.

## 2. Non-negotiables

- Redact or tokenize sensitive PII (SSNs, credit cards, auth tokens, raw secrets, unnecessary identifiers) before sending text to external LLM APIs when not strictly required by the task.
- Never log raw user prompts or model responses containing unredacted PII/credentials.
- Never store real un-anonymized customer PII in `evals/golden-sets/`.
- Enforce zero-data-retention / non-training provider agreements for production customer data.

## 3. Rejection criteria

Fail the task if raw PII or bearer tokens are logged in AI telemetry, unredacted PII is sent unnecessarily to providers, or real customer PII appears in eval datasets.

## 4. Step-by-step procedure

1. Classify data fields entering the AI pipeline and strip unnecessary identifiers.
2. Apply deterministic PII redaction/masking prior to prompt construction and logging.
3. Test redaction against synthetic SSN, email, phone, and token fixtures (`evals/golden-sets/refusal-safety/`).
4. Run `gates/pre-merge/output-guardrails` and `gates/pre-commit/secrets-scan`.

## 5. Evidence required

Redaction unit tests, scrubbed log samples, and passing `gates/pre-merge/output-guardrails` output.

## 6. Anti-patterns

- **REJECT:** `logger.info({ prompt, completion })` with full customer messages.
- **REJECT:** Copying production support transcripts with customer emails/SSNs directly into golden eval JSONL files.

## 7. References

- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)
- [Web security baseline](../../../knowledge/web-security-baseline.md)
