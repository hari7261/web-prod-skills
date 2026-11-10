---
name: i18n-and-timezone
version: 2.0.0
description: Handle locales, RTL layouts, UTF-8 normalization, currencies, and IANA timezones deterministically across SSR and CSR.
applies_to: [frontend, ui]
triggers:
  - formatting dates, times, numbers, or currencies
  - adding multi-language copy or RTL layout support
  - sorting or validating internationalized user strings
requires_gate: gates/pre-merge/tests-unit-integration
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever displaying dates, timestamps, currency amounts, plurals, or localized UI strings.

## 2. Non-negotiables

- Store and transmit all timestamps in UTC ISO-8601; convert to user IANA timezone only at presentation using `Intl.DateTimeFormat`.
- Never use floating-point numbers for money; represent currency in integer minor units (e.g., cents) with ISO-4217 currency codes.
- Use `Intl.NumberFormat` and ICU message/plural formatting instead of manual string concatenation.
- Use CSS logical properties (`margin-inline`, `padding-inline`) and `dir` attribute support for RTL readiness.

## 3. Rejection criteria

Fail the task if timestamps rely on implicit server/browser local timezones, money uses floats, or SSR/CSR produce locale hydration mismatches.

## 4. Step-by-step procedure

1. Pass explicit `locale` and `timeZone` from request/user preferences into formatters.
2. Format currency from integer minor units via `Intl.NumberFormat`.
3. Test RTL, DST boundary timestamps, and non-ASCII/emoji unicode strings.
4. Run `gates/pre-merge/tests-unit-integration` and attach evidence.

## 5. Evidence required

Unit tests covering UTC-to-IANA conversion, DST transitions, minor-unit currency formatting, unicode/RTL cases, and passing `gates/pre-merge/tests-unit-integration` output.

## 6. Anti-patterns

- **REJECT:** Hardcoded `MM/DD/YYYY` string slicing or `amount * 100` float arithmetic.
- **REJECT:** Assuming `new Date()` timezone matches the user's browser during SSR.

## 7. References

- [Frontend baseline](../../../knowledge/frontend-baseline.md)
- [Production readiness](../../../knowledge/production-readiness.md)
