import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runHtmlSinkCheck } from "./checks/html-sinks.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-commit/dangerous-html-scan",
  stage: "pre-commit",
  checks: [{ id: "dangerous-html-sinks", run: runHtmlSinkCheck }]
});
