---
name: cors-and-csrf
version: 2.0.0
description: Enforce exact-origin CORS allowlists and CSRF defenses on all state-changing browser requests.
applies_to: [backend, frontend, security]
triggers:
  - configuring CORS middleware or API access-control headers
  - building cookie-authenticated POST/PUT/PATCH/DELETE endpoints
requires_gate: gates/pre-merge/sast
resources: []
scripts: []
---

## 1. When to use / when not to use

Use on every backend API accessed by browsers, especially cookie-authenticated or credentialed cross-origin APIs.

## 2. Non-negotiables

- Configure CORS with an **exact origin allowlist** (per environment); never reflect arbitrary `Origin` headers or combine `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`.
- Never execute state-changing mutations (`POST`/`PUT`/`PATCH`/`DELETE`) over `GET` endpoints.
- Protect cookie-authenticated state-changing endpoints with `SameSite=Lax`/`Strict` cookies **plus** anti-CSRF tokens or strict `Origin`/`Sec-Fetch-Site` verification.
- Vary responses on `Origin` when dynamic allowlisted origins are returned.

## 3. Rejection criteria

Fail the task if wildcard `*` CORS is paired with credentials, arbitrary origins are reflected, GET routes mutate state, or `gates/pre-merge/sast` fails.

## 4. Step-by-step procedure

1. Load allowed origins from environment config (validated list, no regex wildcards like `*.example.com` without strict anchor).
2. Enforce CSRF token + `Origin` check on cookie-authenticated mutations.
3. Add integration tests for disallowed origin rejection and missing/invalid CSRF token rejection (`403`).
4. Run `gates/pre-merge/sast`.

## 5. Evidence required

Passing `gates/pre-merge/sast` JSON output plus negative CORS and CSRF integration tests.

## 6. Anti-patterns

- **REJECT:** `cors({ origin: true, credentials: true })` reflecting any attacker origin.
- **REJECT:** `origin: "*"` with `credentials: true`.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [SAST gate](../../../gates/pre-merge/sast/README.md)

