import path from "node:path";
import { fileURLToPath } from "node:url";
import { runGate } from "../../../scripts/lib/gate-runner.mjs";
import { runLintCheck } from "./checks/lint-syntax.mjs";

const gateDir = path.dirname(fileURLToPath(import.meta.url));
await runGate({
  gateDir,
  gateId: "pre-commit/lint-and-typecheck",
  stage: "pre-commit",
  checks: [{ id: "lint-and-syntax", run: runLintCheck }]
});
