import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runBundleCheck } from "./checks/budget.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-commit/bundle-budget",
  stage: "pre-commit",
  checks: [{ id: "bundle-size-and-regression", run: runBundleCheck }]
});
