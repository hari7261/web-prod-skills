# AI feature baseline

- Store prompts as versioned files with stable identifiers and change history; never inline production prompt bodies in application code.
- Treat user input, retrieved content, tool output and model output as untrusted.
- Enforce strict schemas for model output and tool arguments; authorize every tool call server-side.
- Defend against direct and indirect prompt injection; delimit untrusted content and do not treat retrieved instructions as policy.
- Bound input/output tokens, concurrency, retries, wall-clock time and per-user spend. Add alarms and abuse controls.
- Stream safely: handle disconnects, partial output, cancellation, timeout, backpressure and provider errors; do not expose internal chain-of-thought or secrets.
- Redact or minimize PII before logging and before sending to providers where feasible.
- Use explicit provider/model fallback rules; record model and prompt versions in traces.
- Maintain golden eval sets for correctness, safety, refusal behavior, retrieval quality and regressions. Prompt changes require an eval run.
- Measure quality, latency, token usage, cost and failure modes in production with privacy-aware telemetry.
