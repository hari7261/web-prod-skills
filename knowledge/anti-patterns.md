# Production anti-patterns (reject on sight)

Any PR or change containing these patterns must be rejected until fixed and re-verified by the applicable gate.

## Security & trust boundaries
- **REJECT:** Secrets, API keys, private keys, or committed `.env` files in source, client bundles, or logs.
- **REJECT:** New or changed HTTP/GraphQL/tRPC route missing server-side authentication and resource/tenant authorization.
- **REJECT:** Request body/query/params used without schema validation (`if (req.body.email)` truthiness checks, `...req.body` spread into DB writes, unknown fields allowed).
- **REJECT:** Unbounded arrays, strings, file uploads, or pagination (`limit` with no server-side ceiling).
- **REJECT:** `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, or dynamic HTML sinks fed by user or LLM output without an allowlist sanitizer and CSP.
- **REJECT:** Wildcard CORS (`*`) combined with credentials, or state-changing cookie-authenticated endpoints without CSRF defense.
- **REJECT:** Unverified webhook bodies or signature verification run on re-serialized JSON instead of raw request bytes.
- **REJECT:** Outbound user-supplied URLs fetched without SSRF allowlist / private-IP / redirect protections.

## AI features
- **REJECT:** Inline production prompt strings inside application code instead of versioned prompt files.
- **REJECT:** Prompt, model, retrieval, or tool changes shipped without an eval run against `evals/golden-sets/` and `evals/baselines/`.
- **REJECT:** LLM output passed directly into SQL, shell, filesystem paths, `eval`, or unvalidated tool calls.
- **REJECT:** Unbounded LLM loops, missing token/cost budgets, or missing timeout/fallback paths.
- **REJECT:** Logging raw prompts, retrieved documents, or user PII unredacted.

## Reliability, data & delivery
- **REJECT:** Swallowed exceptions (`except: pass`, `catch {}`, `catch (e) { console.log(e) }` returning 200 OK).
- **REJECT:** External HTTP/DB/queue/LLM calls without bounded timeouts, jittered retries (only on idempotent/transient errors), or degradation path.
- **REJECT:** Non-idempotent payment, webhook, or mutation endpoints without idempotency keys.
- **REJECT:** Database migration without a tested down-migration (`rollback`) and lock-time analysis.
- **REJECT:** New network, DB, or LLM path without structured logs, metrics, and trace spans.
- **REJECT:** Production deploy without a canary plan (with abort criteria) and tested rollback procedure.
