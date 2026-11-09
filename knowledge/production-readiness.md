# Definition of done

Every applicable item must be satisfied with fresh evidence before a task is called done.

1. **Correctness** — unit + integration tests pass; edge cases covered (empty, null, oversized, unicode, malformed).
2. **Security** — authz on new routes; input validated; secrets clean; LLM output sanitized; no dangerous sinks.
3. **Reliability** — every external call has timeout/retry/fallback; idempotency where applicable; backpressure where applicable.
4. **Observability** — logs, metrics, traces emitted on new paths; alerts tied to SLO.
5. **Data safety** — migration has forward + rollback + backfill plan; lock-time acceptable on prod-sized tables.
6. **Cost** — AI paths have token/rate budget; no unbounded loops; alarms set.
7. **Contract stability** — API schema diff reviewed; breaking changes versioned + changelogged.
8. **Deployability** — canary plan present with abort criteria; env config diff reviewed.
9. **Rollback** — deploy rollback documented and tested; migration rollback tested.
10. **Docs** — runbook exists for new service/feature; ownership recorded.
