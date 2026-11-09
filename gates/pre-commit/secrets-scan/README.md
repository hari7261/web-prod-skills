# Secrets scan gate

**Enforces:** production-readiness 2 (security) and 10 (fresh evidence).

**Inputs:** tracked repository files, excluding Git internals and dependency/build directories.

**Checks:** committed `.env` files (except `.env.example`), common private-key headers, and high-confidence credential assignments. This is a heuristic scanner, not a substitute for provider secret scanning or a full history scan.

**Pass criteria:** zero blocking findings. Exit 1 on any finding.

**Failure format:** one JSON object on stdout with `gate`, `status`, `findings[]` and a human summary on stderr.

**Run:** `npm run gate:secrets`. CI runs the same command.
