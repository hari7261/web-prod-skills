---
name: accessibility
version: 2.0.0
description: Ship WCAG 2.2 AA accessible, keyboard-operable, screen-reader-verified web interfaces.
applies_to: [frontend, ui]
triggers:
  - adding or modifying user-facing UI components
  - building forms, modals, menus, tables, or navigation
  - implementing validation error announcements
requires_gate: gates/pre-merge/accessibility
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for all user-visible UI flows, components, forms, dialogs, and navigation. Do not defer accessibility to post-launch polish.

## 2. Non-negotiables

- Use semantic HTML (`<button>`, `<a href>`, `<nav>`, `<main>`, `<label>`) before ARIA roles.
- Ensure 100% keyboard operability (Tab order, Enter/Space activation, Escape dismissal, focus trapping/restoration in modals).
- Associate every form input with an explicit `<label>` or `aria-label`/`aria-labelledby` and announce errors via `aria-live` / `role="alert"`.
- Maintain WCAG 2.2 AA contrast (>= 4.5:1 normal text, >= 3:1 large text/UI) and visible `:focus-visible` outlines.
- Provide meaningful `alt` text on informative images and `alt=""` on decorative images.

## 3. Rejection criteria

Fail the task if clickable `<div>`/`<span>` elements lack keyboard/role semantics, inputs lack labels, images lack `alt`, focus is trapped or invisible, or `gates/pre-merge/accessibility` reports violations.

## 4. Step-by-step procedure

1. Build structure with native semantic landmarks and controls.
2. Verify keyboard-only navigation and logical focus order.
3. Wire `aria-invalid`, `aria-describedby`, and live error regions for forms and async actions.
4. Run automated axe/a11y checks and `gates/pre-merge/accessibility`.
5. Document manual keyboard and screen-reader verification for critical flows.

## 5. Evidence required

Zero violations in `gates/pre-merge/accessibility` JSON output (`a11y-report.json` + static scan) and keyboard verification notes.

## 6. Anti-patterns

- **REJECT:** `<div onClick={...}>` instead of `<button type="button">`.
- **REJECT:** Using placeholder text as the sole input label.
- **REJECT:** Removing focus outlines (`outline: none`) without a visible replacement.

## 7. References

- [Frontend baseline](../../../knowledge/frontend-baseline.md)
- [Accessibility gate](../../../gates/pre-merge/accessibility/README.md)
