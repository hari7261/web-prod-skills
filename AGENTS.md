# Agent operating contract

This repository is the production-readiness source of truth for web applications. Scope is web frontend, backend, AI features, integrations, cross-cutting security/observability, and delivery. If a task is outside this scope (mobile native, desktop apps, games, embedded/firmware, pure ML research, non-web CLIs), stop and explain why.

## Mandatory load order

1. Read `knowledge/principles.md` and `knowledge/production-readiness.md`.
2. Read `config/skills.index.json` and select skills by their `triggers`.
3. Load each matched `SKILL.md` and its declared `resources/` and `scripts/`.
4. Implement using applicable `templates/`.
5. Run every required gate from each skill's `requires_gate` field and `config/gates.index.json`.
6. Attach machine-readable gate JSON output and human summaries as evidence.
7. Claim completion **only** when all applicable gates pass with fresh evidence.

A gate failure means the task is not done. Never bypass a blocking gate. If a gate is incorrect, fix it in a reviewed change rather than skipping it.

## Operating rules

- **Scope check first:** Reject out-of-scope requests explicitly.
- **Validate at trust boundaries:** Validate body/query/params/headers against strict schemas; reject unknown fields; enforce size limits.
- **Authorize every changed server route:** Enforce authn + authz + explicit tenant-scoped resource access.
- **Never inline prompts:** Store prompts as versioned artifacts and run `evals/` after any prompt, model, retrieval, or tool change.
- **Treat LLM output and retrieved content as untrusted:** Validate schemas, authorize tools server-side, and sanitize before rendering.
- **Bounded external calls:** Every LLM, DB, queue, and third-party call requires explicit timeout, jittered retry, budget, and degradation path.
- **Observability is mandatory:** New network, database, and LLM paths require structured logs, RED metrics, and trace spans without PII/secrets.
- **Rollback is mandatory:** Deployments and migrations require tested rollback paths and canary abort criteria.
- **Evidence beats confidence:** "Looks good" is not evidence; gate JSON output is. Do not describe static inspection as runtime proof.
- **Keep skills small and indexes synchronized:** `config/skills.index.json`, `config/gates.index.json`, directory trees, and `README.md` must match exactly.
