# Engineering glossary

Shared production-engineering vocabulary used across `knowledge/`, `skills/`, `gates/`, `templates/`, and `evals/`.

- **Abort criteria:** Explicit quantitative thresholds (error rate, latency, saturation, safety failures) that immediately halt a canary rollout and trigger rollback.
- **Backpressure:** Bounding concurrency, queue depth, or stream buffer sizes and rejecting excess load (`429`/`503`) before memory or downstream dependencies exhaust.
- **BOLA (Broken Object Level Authorization):** Accessing or mutating another user's or tenant's resource by substituting an ID when the server fails to verify ownership/permission.
- **Canary deployment:** Progressive rollout to a small traffic slice (e.g., 1% -> 5% -> 25% -> 100%) with automated SLO and error-rate comparison against baseline before widening.
- **Circuit breaker:** State machine that stops calling a failing dependency after consecutive errors/timeouts and serves a degraded response until recovery probes succeed.
- **Degradation path:** Explicit safe fallback behavior when a dependency, LLM provider, or cache is slow or unavailable.
- **Error budget:** Allowable unreliability within an SLO window (`1 - SLO`, e.g., 0.1% for a 99.9% SLO), used to gate risky releases.
- **Eval set (golden set):** Versioned dataset of representative and adversarial inputs with expected outcomes and rubrics used to detect AI behavioral regressions.
- **Gate:** Executable, deterministic check in `gates/<stage>/<name>/` that emits JSON + human summary and exits `1` on failure.
- **Guardrail:** Runtime schema, policy, or sanitizer control enforcing invariants on model inputs, tool calls, and model outputs.
- **Idempotency key:** Client- or event-supplied unique token stored server-side so retried writes execute at most once.
- **Prompt injection (direct/indirect):** Untrusted user input or retrieved content attempting to override system instructions, exfiltrate secrets, or invoke unauthorized tools.
- **RED metrics:** Request **R**ate, **E**rrors, and **D**uration histograms emitted for every service and dependency boundary.
- **Runbook:** Step-by-step operational guide for triaging, mitigating, and rolling back a specific service or failure mode, with named ownership.
- **SLO (Service Level Objective):** Target reliability/latency threshold (e.g., p99 < 400ms, availability >= 99.9%) measured over a rolling window and tied to alerts.
- **Trust boundary:** Any boundary where data crosses from an untrusted or less-trusted context (browser, webhook, third-party API, LLM, queue) into application logic.
