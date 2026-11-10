import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runOutputGuardrailsCheck } from "./checks/guardrails.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/output-guardrails",
  stage: "pre-merge",
  checks: [{ id: "llm-output-validation-and-sinks", run: runOutputGuardrailsCheck }]
});

