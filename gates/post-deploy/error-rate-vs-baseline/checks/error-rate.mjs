import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runErrorRateCheck(context) {
  const findings = [];
  const raw = await readTextSafe(path.join(context.targetDir, "error-rate-report.json"));
  if (raw === null) return { findings };
  let report;
  try {
    report = JSON.parse(raw);
  } catch (err) {
    return { findings: [{ id: "INVALID_ERROR_RATE_REPORT", file: "error-rate-report.json", message: err.message }] };
  }
  const maxDelta = Number(context.config.max_delta_pct ?? 0.5);
  const minWindow = Number(context.config.min_observation_minutes ?? 10);
  const baseline = Number(report.baselineErrorRatePct ?? 0);
  const current = Number(report.currentErrorRatePct ?? 0);
  const obs = Number(report.observationMinutes ?? 0);

  if (obs < minWindow) {
    findings.push({ id: "INSUFFICIENT_OBSERVATION_WINDOW", actual: obs, required: minWindow, message: `Observation window ${obs}m is below ${minWindow}m.` });
  }
  if (current > baseline + maxDelta) {
    findings.push({ id: "ERROR_RATE_SPIKE", baseline, current, maxAllowed: baseline + maxDelta, message: `Error rate ${current}% exceeds baseline (${baseline}%) + ${maxDelta}%.` });
  }
  return { findings };
}

