import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";
import { parseYaml } from "../../../../scripts/lib/yaml.mjs";

export async function runCanaryPlanCheck(context) {
  const findings = [];
  const jsonRaw = await readTextSafe(path.join(context.targetDir, "deploy-plan.json"));
  const yamlRaw = await readTextSafe(path.join(context.targetDir, "deploy-plan.yaml"));
  if (jsonRaw === null && yamlRaw === null) return { findings };

  let plan;
  try {
    plan = jsonRaw !== null ? JSON.parse(jsonRaw) : parseYaml(yamlRaw);
  } catch (err) {
    return { findings: [{ id: "INVALID_DEPLOY_PLAN", message: err.message }] };
  }

  const pct = Number(plan.canary_percent);
  const maxPct = Number(context.config.max_initial_canary_percent ?? 25);
  const win = Number(plan.observation_window_minutes);
  const minWin = Number(context.config.min_observation_minutes ?? 10);
  if (!Number.isFinite(pct) || pct <= 0 || pct > maxPct) {
    findings.push({ id: "INVALID_CANARY_PERCENT", actual: plan.canary_percent, message: `canary_percent must be between 1 and ${maxPct}.` });
  }
  if (!Number.isFinite(win) || win < minWin) {
    findings.push({ id: "INSUFFICIENT_OBSERVATION_WINDOW", actual: plan.observation_window_minutes, message: `observation_window_minutes must be >= ${minWin}.` });
  }
  if (!plan.abort_criteria || (Array.isArray(plan.abort_criteria) && plan.abort_criteria.length === 0)) {
    findings.push({ id: "MISSING_ABORT_CRITERIA", message: "Deploy plan must define explicit abort_criteria." });
  }
  return { findings };
}
