import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runLlmResilienceCheck } from "./checks/resilience.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-merge/llm-call-resilience",
  stage: "pre-merge",
  checks: [{ id: "llm-timeout-retry-fallback-budget", run: runLlmResilienceCheck }]
});

