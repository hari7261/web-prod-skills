---
name: security-headers
version: 2.0.0
description: Ship strict HTTP security headers including nonce-based CSP, HSTS, X-Frame-Options, and X-Content-Type-Options.
applies_to: [frontend, backend, security]
triggers:
  - configuring HTTP server, reverse proxy, or Next.js/Express security middleware
  - updating Content-Security-Policy or framing rules
requires_gate: gates/pre-merge/sast
resources: []
scripts: []
---

## 1. When to use / when not to use

Use on every web frontend, SSR server, and HTTP API gateway.

## 2. Non-negotiables

- Ship `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HTTPS environments), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `frame-ancestors 'none'` (or explicit allowlist).
- Enforce a restrictive `Content-Security-Policy` without `'unsafe-eval'` or `'unsafe-inline'` scripts in production (use per-request nonces or hashes).
- Disable `X-Powered-By` server fingerprinting headers.
- Restrict `Permissions-Policy` to explicitly needed browser capabilities.

## 3. Rejection criteria

Fail the task if CSP includes `'unsafe-eval'` or wildcard `script-src *`, framing protections are absent, or TLS/header tests fail.

## 4. Step-by-step procedure

1. Configure centralized security header middleware at the edge/app boundary.
2. Generate per-request cryptographic CSP nonces for SSR scripts where needed.
3. Verify headers via automated integration tests on HTML and API responses.
4. Run `gates/pre-merge/sast`.

## 5. Evidence required

Integration test assertions verifying response security headers and passing `gates/pre-merge/sast` output.

## 6. Anti-patterns

- **REJECT:** `Content-Security-Policy: default-src * 'unsafe-inline' 'unsafe-eval'`.
- **REJECT:** Leaving `X-Powered-By: Express` enabled in production.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [SAST gate](../../../gates/pre-merge/sast/README.md)
