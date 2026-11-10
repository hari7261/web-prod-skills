# Frontend App Template

Production-ready frontend starter patterns: error boundaries, safe sanitized HTML rendering, and Core Web Vitals reporting.

## Included files
- `ErrorBoundary.tsx` — isolates rendering failures with fallback UI and structured telemetry.
- `safe-html.ts` — allowlist HTML sanitization wrapper; never pass raw untrusted or LLM HTML to the DOM.
- `web-vitals.ts` — LCP, INP, and CLS reporter against production SLO budgets.
