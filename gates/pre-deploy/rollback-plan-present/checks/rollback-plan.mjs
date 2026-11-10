import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runRollbackPlanCheck(context) {
  const findings = [];
  const raw = await readTextSafe(path.join(context.targetDir, "rollback-plan.json"));
  if (raw === null) return { findings };
  let plan;
  try {
    plan = JSON.parse(raw);
  } catch (err) {
    return { findings: [{ id: "INVALID_ROLLBACK_PLAN", file: "rollback-plan.json", message: err.message }] };
  }
  if (typeof plan.targetVersion !== "string" || !plan.targetVersion.trim()) {
    findings.push({ id: "MISSING_ROLLBACK_TARGET", message: "Rollback plan must specify targetVersion." });
  }
  if (typeof plan.command !== "string" || !plan.command.trim()) {
    findings.push({ id: "MISSING_ROLLBACK_COMMAND", message: "Rollback plan must specify executable rollback command." });
  }
  if (context.config.require_tested_rollback !== false && plan.tested !== true) {
    findings.push({ id: "ROLLBACK_NOT_TESTED", message: "Deploy rollback procedure must be tested before release." });
  }
  return { findings };
}
