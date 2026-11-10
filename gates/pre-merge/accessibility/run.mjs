import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runAccessibilityCheck } from "./checks/a11y.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/accessibility",
  stage: "pre-merge",
  checks: [{ id: "wcag-aa-a11y", run: runAccessibilityCheck }]
});

