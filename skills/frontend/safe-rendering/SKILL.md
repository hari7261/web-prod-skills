---
name: safe-rendering
version: 2.0.0
description: Prevent XSS and DOM injection by sanitizing untrusted and LLM-generated content before rendering.
applies_to: [frontend, security, ai]
triggers:
  - rendering markdown, rich text, HTML, or SVG
  - displaying LLM-generated text or citations in the UI
  - building dynamic links from user or model data
requires_gate: gates/pre-commit/dangerous-html-scan
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever rendering user-supplied, retrieved, third-party, or LLM-generated strings, Markdown, HTML, SVGs, or URLs in the browser.

## 2. Non-negotiables

- Prefer plain text bindings (`textContent`, JSX `{text}`) over raw HTML sinks.
- Never pass untrusted or LLM output to `innerHTML`, `outerHTML`, `dangerouslySetInnerHTML`, `v-html`, or `document.write` without an allowlist sanitizer (`DOMPurify` with strict tag/attribute allowlist).
- Validate URLs rendered in `<a href>` / `<img src>` against an explicit `https:`/`http:` allowlist (reject `javascript:`, `data:`, `vbscript:`).
- Enforce a restrictive Content Security Policy (CSP) without `'unsafe-inline'` or `'unsafe-eval'`.

## 3. Rejection criteria

Fail the task if raw user or LLM output enters a DOM HTML sink, `javascript:` URLs are accepted in links, or `gates/pre-commit/dangerous-html-scan` fails.

## 4. Step-by-step procedure

1. Default to plain-text rendering or safe Markdown AST components without raw HTML passthrough.
2. When rich HTML is required, sanitize via `templates/frontend-app/safe-html.ts` (`DOMPurify` allowlist).
3. Validate external link schemes explicitly before rendering `href`.
4. Add XSS payload regression tests (`<script>`, `onerror=`, `javascript:`).
5. Run `gates/pre-commit/dangerous-html-scan` and attach JSON output.

## 5. Evidence required

Passing `gates/pre-commit/dangerous-html-scan` JSON output and XSS unit/integration test results.

## 6. Anti-patterns

- **REJECT:** `<div dangerouslySetInnerHTML={{ __html: llmResponse }} />`.
- **REJECT:** Regex-based HTML stripping instead of a maintained parser/sanitizer.
- **REJECT:** Rendering `<a href={userOrModelUrl}>` without scheme validation.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [Dangerous HTML scan gate](../../../gates/pre-commit/dangerous-html-scan/README.md)
