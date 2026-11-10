import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runSloCheck(context) {
  const findings = [];
  const raw = await readTextSafe(path.join(context.targetDir, "slo-report.json"));
  if (raw === null) return { findings };
  let report;
  try {
    report = JSON.parse(raw);
  } catch (err) {
    return { findings: [{ id: "INVALID_SLO_REPORT", file: "slo-report.json", message: err.message }] };
  }
  const minAvail = Number(context.config.min_availability_pct ?? 99.9);
  const maxP99 = Number(context.config.max_p99_latency_ms ?? 400);
  if (Number(report.availabilityPct ?? 0) < minAvail) {
    findings.push({ id: "SLO_AVAILABILITY_BREACH", actual: report.availabilityPct, target: minAvail, message: `Availability ${report.availabilityPct}% < ${minAvail}%.` });
  }
  if (Number(report.p99LatencyMs ?? 0) > maxP99) {
    findings.push({ id: "SLO_LATENCY_BREACH", actual: report.p99LatencyMs, target: maxP99, message: `p99 latency ${report.p99LatencyMs}ms > ${maxP99}ms.` });
  }
  return { findings };
}

