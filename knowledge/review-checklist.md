# Human & agent review checklist

Use this checklist before approving any PR or claiming any task done. Used by `gates/pre-merge/` checks and PR reviews.

## 1. Scope & Contract
- [ ] Task is within web application scope (frontend, backend, AI features, integrations, cross-cutting, delivery).
- [ ] All triggered `skills/` were loaded from `config/skills.index.json` and followed.
- [ ] Applicable `templates/` were used for new routes, AI endpoints, integrations, migrations, flags, runbooks, or ADRs.

## 2. Correctness & Edge Cases
- [ ] Unit and integration tests cover happy path + empty, null, oversized, unicode, malformed, and unknown-field inputs.
- [ ] Error states, loading states, and timeouts behave predictably without leaking internal stack traces or secrets.

## 3. Security & Privacy
- [ ] Every new/changed route enforces server-side authn + authz + explicit tenant isolation.
- [ ] All external inputs (HTTP, webhooks, queues, LLM output, retrieved docs) are validated against strict schemas with unknown fields rejected.
- [ ] No dangerous HTML sinks (`dangerouslySetInnerHTML`, `innerHTML`, `v-html`) with unsanitized/untrusted data.
- [ ] No hardcoded secrets, committed `.env` files, or PII in logs/metrics.
- [ ] Dependencies are pinned and scanned; no new high/critical SAST or CVE findings.

## 4. Reliability, AI & Integrations
- [ ] Every external call (LLM, third-party API, DB, queue) has explicit timeout, bounded retry with backoff/jitter, circuit breaker/fallback, and rate/token budget.
- [ ] Prompts are stored in versioned files and evals pass against `evals/baselines/` with zero safety regression.
- [ ] Webhooks verify raw-byte HMAC signatures and enforce timestamp/replay protection + idempotency.

## 5. Observability, Data & Delivery
- [ ] New network/DB/LLM paths emit structured logs (correlation ID), RED metrics, and trace spans.
- [ ] API schema diffs are reviewed; breaking changes are versioned and changelogged.
- [ ] DB migrations include a dry-run lock check and a tested down-migration.
- [ ] Deploy plan includes canary %, observation window, abort criteria, env config diff, runbook, and tested rollback.
- [ ] Every required gate ran on the exact commit and exited `0` with JSON + human summary attached.
