import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runPromptEvalsCheck } from "./checks/evals.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/prompt-evals",
  stage: "pre-merge",
  checks: [{ id: "golden-set-regression-check", run: runPromptEvalsCheck }]
});

