import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileExists } from "../../../../scripts/lib/files.mjs";

export async function runPromptEvalsCheck(context) {
  const runner = path.join(context.repoRoot, "evals", "runners", "run-suite.mjs");
  const reportPath = path.join(context.targetDir, "eval-report.json");
  const args = [runner];
  if (await fileExists(reportPath)) {
    args.push("--report", reportPath);
  }
  const res = spawnSync(process.execPath, args, { encoding: "utf8", cwd: context.repoRoot });
  if (res.status !== 0) {
    return {
      findings: [{ id: "PROMPT_EVALS_FAILED", message: (res.stderr || res.stdout || "Eval suite failed").trim().slice(0, 500) }]
    };
  }
  return { findings: [] };
}

