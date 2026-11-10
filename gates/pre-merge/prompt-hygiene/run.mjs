import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runPromptHygieneCheck } from "./checks/hygiene.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/prompt-hygiene",
  stage: "pre-merge",
  checks: [{ id: "versioned-prompt-hygiene", run: runPromptHygieneCheck }]
});
