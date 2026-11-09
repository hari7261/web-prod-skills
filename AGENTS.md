# Agent operating contract

This repository is the production-readiness source of truth for web applications. Scope is web frontend, backend, AI features, integrations, and delivery. If a task is outside this scope, stop and explain why.

## Mandatory load order

1. Read `knowledge/principles.md` and `knowledge/production-readiness.md`.
2. Read `config/skills.index.json` and select skills by their triggers.
3. Load each matched `SKILL.md` and its declared resources.
4. Use applicable templates.
5. Run every required gate.
6. Attach machine-readable gate output and human summaries as evidence.
7. Claim completion only when all applicable gates pass with fresh evidence.

A gate failure means the task is not done. Never bypass a blocking gate. If a gate is incorrect, fix it in a reviewed change rather than skipping it.

## Operating rules

- Validate at trust boundaries; reject unknown fields.
- Authorize every changed server route, including tenant-scoped resource access.
- Treat LLM output and retrieved content as untrusted.
- Keep prompts versioned and run evals after prompt changes.
- External calls require bounded timeouts, retries, budgets, and degradation.
- New network, database, and LLM paths require logs, metrics, and traces.
- Deployments and migrations require tested rollback paths.
- Evidence beats confidence. Do not describe static inspection as runtime proof.
- Keep skills small and indexes synchronized.
