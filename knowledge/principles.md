# Production principles

These ten principles are mandatory for every applicable web application change.

1. **Validate at the boundary.** Server-side validation is mandatory even if the client validates. Reject unknown fields. Bound array and string sizes. Validate content-type. Validate against a schema, not truthiness.
2. **Authorize server-side on every route.** Authn + authz on every new or changed endpoint. Tenant isolation is explicit, not assumed.
3. **Secrets never live in code.** No secrets in source, frontend bundles, committed `.env` files, or logs.
4. **Every external call has timeout, retry with backoff, and a degradation path.** LLM, third-party API, DB, queue — all of them.
5. **LLM output is untrusted input.** Never insert into DOM, SQL, shell, file paths, or eval without validation/sanitization/allowlist.
6. **Prompts are versioned artifacts, not inline strings.** Prompt changes require an eval run.
7. **Observability is not optional.** Every new network/DB/LLM path emits structured logs, metrics, and a trace span.
8. **Rollback exists or it doesn’t ship.** Every deploy has a documented rollback. Every migration has a tested down-migration.
9. **Cost is bounded.** AI paths have token/rate budgets and alarms. No unbounded loops.
10. **“Done” requires fresh evidence.** Gate output attached. No gate pass = task not done.
