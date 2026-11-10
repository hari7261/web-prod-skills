---
name: streaming-safety
version: 2.0.0
description: Stream LLM tokens safely with cancellation, backpressure, incremental guardrails, and clean failure handling.
applies_to: [ai, backend, frontend]
triggers:
  - implementing SSE or WebSocket LLM token streaming
  - handling mid-stream errors, disconnects, or tool calls
requires_gate: gates/pre-merge/llm-call-resilience
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever streaming LLM tokens over Server-Sent Events (SSE), WebSockets, or HTTP chunked responses.

## 2. Non-negotiables

- Propagate client disconnect (`req.on("close")` / `AbortController.abort()`) immediately to the upstream LLM request to avoid wasted tokens.
- Enforce total stream duration timeout, max streamed tokens, and backpressure limits.
- Never stream raw internal chain-of-thought, system prompts, or stack traces to the client.
- Apply incremental/final output guardrails and emit structured end-of-stream completion/error events (`[DONE]` / typed error event).

## 3. Rejection criteria

Fail the task if client disconnect leaves upstream LLM billing running, streams hang without timeouts, or partial raw exceptions leak to clients.

## 4. Step-by-step procedure

1. Link HTTP request abort signal directly to the LLM provider `AbortController`.
2. Set `Content-Type: text/event-stream`, `Cache-Control: no-cache`, and heartbeat/timeout timers.
3. Enforce max token cap and buffer/sanitize hazardous patterns before flushing chunks.
4. Test client abort mid-stream, upstream mid-stream disconnect, and timeout recovery.
5. Run `gates/pre-merge/llm-call-resilience`.

## 5. Evidence required

Passing `gates/pre-merge/llm-call-resilience` output and streaming abort/timeout integration tests.

## 6. Anti-patterns

- **REJECT:** Streaming without hooking `AbortController` to client socket close.
- **REJECT:** Sending raw provider exception JSON inside SSE error chunks.

## 7. References

- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)
- [LLM call resilience gate](../../../gates/pre-merge/llm-call-resilience/README.md)
