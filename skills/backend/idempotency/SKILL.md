---
name: idempotency
version: 2.0.0
description: Guarantee safe retries and at-most-once side effects for mutations, payments, and webhook consumers.
applies_to: [backend, api, reliability]
triggers:
  - implementing POST/PUT/PATCH mutations with side effects
  - handling payment charges, refunds, or order creation
  - processing retried webhooks or background jobs
requires_gate: gates/pre-merge/tests-unit-integration
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for payments, account provisioning, webhooks, job consumers, and any state-changing endpoint clients or queues may retry.

## 2. Non-negotiables

- Require `Idempotency-Key` (bounded length, scoped to `tenantId` + route + method) on retryable write endpoints.
- Persist key + request payload hash + final response atomically (unique constraint / transaction) before side effects complete.
- Reject key reuse with a different payload hash (`409 Conflict` / `422`).
- Return `409` or wait cleanly on concurrent in-flight duplicate requests; never execute side effects twice.

## 3. Rejection criteria

Fail the task if retried requests create duplicate charges/records, keys are not scoped per tenant, or payload mismatch on key reuse silently returns stale data.

## 4. Step-by-step procedure

1. Add unique `(tenant_id, endpoint, idempotency_key)` storage with TTL cleanup.
2. Hash canonical request body and compare on replay.
3. Wrap state transition and idempotency record update atomically (or outbox pattern).
4. Test concurrent duplicate requests, replay after success, and mismatched-payload replay.
5. Run `gates/pre-merge/tests-unit-integration`.

## 5. Evidence required

Integration tests proving zero duplicate side effects under concurrent/sequential retries and passing `gates/pre-merge/tests-unit-integration` output.

## 6. Anti-patterns

- **REJECT:** Checking `if (await exists)` without a unique DB constraint (TOCTOU race condition).
- **REJECT:** Global idempotency keys not scoped to `tenantId`.

## 7. References

- [Reliability baseline](../../../knowledge/reliability-baseline.md)
- [Backend baseline](../../../knowledge/backend-baseline.md)
