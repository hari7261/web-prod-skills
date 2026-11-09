# Backend baseline

- Define and review API contracts before implementation; version breaking changes and publish changelog entries.
- Validate every request server-side with strict schemas; reject unknown fields and bound payloads.
- Authenticate and authorize every route; scope tenant data in database queries.
- Bound pagination, sorting, filters, uploads and query complexity.
- Use parameterized queries and least-privilege database roles.
- Design migrations for expand/contract rollout; include tested down migration or an explicitly approved irreversible-migration plan, backfill strategy and lock-time estimate.
- Detect N+1 query patterns; inspect query plans and index selectivity on production-shaped data.
- Make background jobs idempotent, bounded, observable and retry-safe.
- Set DB statement and connection timeouts; define pool limits and overload behavior.
