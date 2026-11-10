# pre-commit/lint-and-typecheck

## Production-readiness items enforced
- 1. Correctness

## Inputs
- Changed or tracked `.js`, `.mjs`, `.json` files, or `lint-report.json`.

## Pass criteria
- Zero syntax errors, zero merge-conflict markers, zero `debugger` statements, zero invalid JSON files, and zero errors in `lint-report.json` (if present).

## Failure message format
JSON report with `status: "fail"` and `findings` array (`id`, `file`, `message`), plus human-readable `[FAIL]` line on stderr, exiting with code `1`.

## How to run
```sh
node gates/pre-commit/lint-and-typecheck/run.mjs
```
