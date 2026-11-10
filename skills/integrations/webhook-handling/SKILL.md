---
name: webhook-handling
version: 2.0.0
description: Verify raw-byte HMAC webhook signatures, enforce replay windows, and process events idempotently.
applies_to: [backend, integrations, security]
triggers:
  - receiving inbound webhooks from Stripe, GitHub, Slack, or partners
  - verifying webhook signatures or replay protection
requires_gate: gates/pre-merge/sast
resources: []
scripts: [scripts/check-webhook-safety.mjs]
---

## 1. When to use / when not to use

Use for every inbound webhook endpoint. Never accept unauthenticated webhook payloads.

## 2. Non-negotiables

- Verify HMAC signatures using constant-time comparison (`timingSafeEqual`) over the **exact raw request bytes** before JSON parsing.
- Enforce timestamp skew tolerance (e.g., `<= 300s`) and persist processed event IDs to block replay attacks and duplicates.
- Validate parsed payload against a strict schema and enforce bounded payload size.
- Acknowledge fast (`2xx`) only after signature verification and durable persistence/enqueueing.

## 3. Rejection criteria

Fail the task if webhook handlers skip signature checks, compute HMAC over `JSON.stringify(req.body)`, omit replay protection, or fail `scripts/check-webhook-safety.mjs`.

## 4. Step-by-step procedure

1. Preserve raw request buffer at the route boundary (`templates/integration-client/webhook-handler.ts`).
2. Verify HMAC signature with `crypto.timingSafeEqual` and timestamp skew check.
3. Record `event.id` in a unique idempotency store before processing.
4. Test invalid signature, expired timestamp, replayed event ID, and malformed payload.
5. Run `scripts/check-webhook-safety.mjs` and `gates/pre-merge/sast`.

## 5. Evidence required

Passing `scripts/check-webhook-safety.mjs` and `gates/pre-merge/sast` outputs plus signature/replay tests.

## 6. Anti-patterns

- **REJECT:** `createHmac(...).update(JSON.stringify(req.body))` (whitespace/key-order mismatch breaks or bypasses checks).
- **REJECT:** Comparing HMAC hex strings with `===` instead of `timingSafeEqual`.

## 7. References

- [Integration baseline](../../../knowledge/integration-baseline.md)
- [Web security baseline](../../../knowledge/web-security-baseline.md)
