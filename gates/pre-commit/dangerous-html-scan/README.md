# pre-commit/dangerous-html-scan

## Production-readiness items enforced
- 2. Security

## Inputs
- Frontend and shared JS/TS/Vue/Svelte files.

## Pass criteria
- Zero occurrences of `innerHTML`, `outerHTML`, `dangerouslySetInnerHTML`, `v-html`, or `document.write` without an allowlist sanitizer import/call or reasoned exemption (`WEB-PROD-HTML-EXEMPT: <reason>`).

## Failure message format
JSON report with `status: "fail"` and `findings` array, exiting with code `1`.

## How to run
```sh
node gates/pre-commit/dangerous-html-scan/run.mjs
```
