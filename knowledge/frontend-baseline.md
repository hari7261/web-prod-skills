# Frontend baseline

- Establish per-route JavaScript budgets and track compressed transfer size.
- Target Core Web Vitals: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 at the 75th percentile, segmented by device where meaningful.
- Keep SSR output deterministic; avoid time, random, locale and browser-only state during initial render unless serialized consistently.
- Use semantic HTML, keyboard-operable controls, visible focus, accessible names and WCAG 2.2 AA checks.
- Add error boundaries at meaningful route/widget boundaries and actionable recovery states.
- Avoid unsafe HTML rendering; sanitize explicitly allowed rich text with a maintained allowlist sanitizer.
- Respect CSP; do not introduce inline script/eval requirements without security review.
- Validate forms on client for UX and on server for security; announce errors accessibly.
- Handle timezone and locale explicitly; do not assume browser timezone is business timezone.
