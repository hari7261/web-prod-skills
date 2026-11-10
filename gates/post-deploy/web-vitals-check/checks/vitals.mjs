import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

export async function runWebVitalsCheck(context) {
  const findings = [];
  const raw = await readTextSafe(path.join(context.targetDir, "web-vitals-report.json"));
  if (raw === null) return { findings };
  let report;
  try {
    report = JSON.parse(raw);
  } catch (err) {
    return { findings: [{ id: "INVALID_WEB_VITALS_REPORT", file: "web-vitals-report.json", message: err.message }] };
  }
  const maxLcp = Number(context.config.max_lcp_ms ?? 2500);
  const maxInp = Number(context.config.max_inp_ms ?? 200);
  const maxCls = Number(context.config.max_cls ?? 0.1);
  if (Number(report.lcpMs ?? 0) > maxLcp) findings.push({ id: "LCP_BREACH", actual: report.lcpMs, budget: maxLcp, message: `LCP ${report.lcpMs}ms > ${maxLcp}ms.` });
  if (Number(report.inpMs ?? 0) > maxInp) findings.push({ id: "INP_BREACH", actual: report.inpMs, budget: maxInp, message: `INP ${report.inpMs}ms > ${maxInp}ms.` });
  if (Number(report.cls ?? 0) > maxCls) findings.push({ id: "CLS_BREACH", actual: report.cls, budget: maxCls, message: `CLS ${report.cls} > ${maxCls}.` });
  return { findings };
}

