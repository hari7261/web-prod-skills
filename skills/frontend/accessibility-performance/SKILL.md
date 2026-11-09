---
name: accessibility-performance
version: 1.0.0
description: Ship accessible, responsive web experiences with measurable performance budgets.
applies_to: [frontend]
triggers:
  - adding or changing user-facing UI
  - changing routing, rendering or client bundles
  - adding interactive components or forms
requires_gate: gates/pre-merge/frontend-quality
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for user-visible frontend changes, including SSR/streaming, forms, navigation and interactive components.

## 2. Non-negotiables

- Semantic HTML and keyboard-operable interactions.
- Accessible names, labels, error announcements and visible focus.
- Meet WCAG 2.2 AA for applicable flows.
- Avoid unsafe HTML sinks and respect CSP.
- Set route-level JS and asset budgets.
- Track Core Web Vitals; target LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 at p75 unless product-specific SLOs supersede these.
- Avoid hydration mismatch and layout shift.

## 3. Rejection criteria

Reject inaccessible keyboard flows, unlabeled form controls, unannounced validation errors, unbounded client bundles, or unsafe model/user HTML rendering.

## 4. Step-by-step procedure

1. Define user journeys and supported assistive technology expectations.
2. Implement semantic structure and keyboard behavior.
3. Test focus order, labels, contrast and error announcements.
4. Measure route bundle and Core Web Vitals on representative devices.
5. Test loading, empty, error and slow-network states.
6. Attach automated and manual accessibility/performance evidence.

## 5. Evidence required

Accessibility test output, manual keyboard/screen-reader notes for critical flows, bundle report and field/lab performance metrics.

## 6. Anti-patterns

- **REJECT:** clickable divs without keyboard semantics.
- **REJECT:** placeholder text as the only form label.
- **REJECT:** shipping large dependencies without bundle impact review.
- **REJECT:** treating Lighthouse score as a substitute for field data.

## 7. References

- [Frontend baseline](../../../knowledge/frontend-baseline.md)
