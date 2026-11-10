---
name: payment-integrations
version: 2.0.0
description: Handle payments, checkout, and billing webhooks with server-authoritative pricing, idempotency, and PCI isolation.
applies_to: [backend, integrations, security]
triggers:
  - integrating Stripe, PayPal, Razorpay, or billing/subscription flows
  - handling checkout, refunds, or entitlement updates
requires_gate: gates/pre-merge/sast
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for all checkout, subscription, invoice, refund, and billing-entitlement endpoints.

## 2. Non-negotiables

- Compute prices, discounts, tax, and currency totals **strictly on the server** from authoritative catalog IDs; never trust client-submitted amounts or prices.
- Represent money as integer minor units + ISO-4217 currency code; never use floating-point arithmetic.
- Never handle raw PAN/CVV card data on application servers; use hosted/tokenized SDKs (PCI SAQ-A).
- Require idempotency keys on every charge/refund API call and verify signed billing webhooks before granting entitlements.

## 3. Rejection criteria

Fail the task if amounts come from client requests, floats are used for currency, webhooks grant entitlements without signature verification, or idempotency keys are omitted.

## 4. Step-by-step procedure

1. Derive line-item totals server-side from catalog price IDs.
2. Pass deterministic idempotency keys to payment provider calls.
3. Grant/revoke entitlements inside idempotent webhook handlers verified on raw bytes (`skills/integrations/webhook-handling`).
4. Test tampered client price rejection, duplicate charge prevention, and webhook replay rejection.
5. Run `gates/pre-merge/sast` and `gates/pre-merge/input-validation`.

## 5. Evidence required

Passing `gates/pre-merge/sast` + `gates/pre-merge/input-validation` outputs and payment negative tests.

## 6. Anti-patterns

- **REJECT:** `await stripe.paymentIntents.create({ amount: req.body.total })`.
- **REJECT:** Granting paid plan access purely from client redirect `?success=true` query params.

## 7. References

- [Integration baseline](../../../knowledge/integration-baseline.md)
- [Web security baseline](../../../knowledge/web-security-baseline.md)
