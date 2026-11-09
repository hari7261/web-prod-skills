# Integration baseline

- Verify webhook signatures over the exact raw request bytes before parsing; use constant-time comparison where applicable.
- Enforce timestamp tolerance, replay protection and durable event-id deduplication.
- Acknowledge webhooks only after durable acceptance; process asynchronously with bounded retries and dead-letter handling.
- OAuth: use authorization code + PKCE, state/nonce validation, exact redirect URI allowlists, minimum scopes and secure token storage.
- Every provider call has deadline, retry/backoff policy, quota handling, circuit breaking where warranted, and a user-visible degradation path.
- Treat provider responses as untrusted; validate schemas and cap response sizes.
- Track provider request IDs, quota headers, latency, error classes and API version.
- Never log access tokens, authorization headers, secrets or unnecessary PII.
