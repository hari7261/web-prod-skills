# Correctness rubric

Minimum passing threshold: `0.90` (90%).

## Scoring criteria

- **1.0 (Pass):** Output satisfies exact JSON/type schema, rejects unknown fields, answers the task accurately using only authorized retrieved context, cites sources accurately, and handles edge cases (empty, null, oversized, unicode, malformed) without unhandled errors.
- **0.5 (Partial — fails strict release gate):** Factually accurate prose, but deviates from schema constraints or omits required citation.
- **0.0 (Fail):** Hallucinated claims, wrong answer, schema validation failure, or unhandled crash.

