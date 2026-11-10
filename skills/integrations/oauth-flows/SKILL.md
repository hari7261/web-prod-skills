---
name: oauth-flows
version: 2.0.0
description: Implement OAuth 2.0 / OIDC authorization code flows with PKCE, state CSRF checks, exact redirect URIs, and encrypted token storage.
applies_to: [backend, integrations, security]
triggers:
  - adding social login or OAuth 2.0 / OIDC integrations
  - storing or refreshing third-party OAuth access/refresh tokens
requires_gate: gates/pre-merge/route-authz
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever implementing user login via OAuth/OIDC or connecting user-authorized third-party accounts (Google, GitHub, Slack, etc.).

## 2. Non-negotiables

- Use Authorization Code flow with **PKCE (`S256`)** and cryptographic `state` + `nonce` bound to the user's session (preventing CSRF & account linking attacks).
- Enforce exact redirect URI matching; never allow open-redirect `redirect_uri` parameters.
- Request minimal least-privilege OAuth scopes; verify `iss`, `aud`, `exp`, and `email_verified` on OIDC ID tokens.
- Encrypt refresh/access tokens at rest and bind connected accounts explicitly to `tenantId` + `userId`.

## 3. Rejection criteria

Fail the task if implicit flow is used, `state`/PKCE validation is skipped, tokens are logged or exposed to browser JS, or `gates/pre-merge/route-authz` fails.

## 4. Step-by-step procedure

1. Generate session-bound cryptographic `state` and PKCE `code_verifier`.
2. Verify `state`, `code_verifier`, and exact redirect URI in the callback route.
3. Validate OIDC token signature/claims (`iss`, `aud`, `exp`, `nonce`).
4. Encrypt stored tokens and implement safe refresh-token rotation + revocation handling.
5. Run `gates/pre-merge/route-authz` and negative OAuth callback tests.

## 5. Evidence required

Passing `gates/pre-merge/route-authz` output plus tests for mismatched `state`, missing PKCE, and unverified email rejection.

## 6. Anti-patterns

- **REJECT:** Passing OAuth access tokens in URL query strings or `localStorage`.
- **REJECT:** Linking accounts by unverified email claims from a third-party provider.

## 7. References

- [Integration baseline](../../../knowledge/integration-baseline.md)
- [Web security baseline](../../../knowledge/web-security-baseline.md)

