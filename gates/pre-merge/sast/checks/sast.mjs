import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

const EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".py", ".go"]);
const RULES = [
  { id: "SAST_EVAL", re: /\beval\s*\(|\bnew\s+Function\s*\(/, message: "Dynamic code execution (eval / new Function) is prohibited." },
  { id: "SAST_SQL_INTERPOLATION", re: /(?:SELECT|INSERT|UPDATE|DELETE)\b[^`"']*\$\{[^}]+\}/i, message: "Possible SQL injection via template string interpolation." },
  { id: "SAST_TLS_DISABLED", re: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*["']0["']/, message: "TLS certificate verification must not be disabled." },
  { id: "SAST_CORS_WILDCARD_CREDENTIALS", re: /origin\s*:\s*["']\*["'][\s\S]{0,120}credentials\s*:\s*true|credentials\s*:\s*true[\s\S]{0,120}origin\s*:\s*["']\*["']/, message: "Wildcard CORS origin must not be combined with credentials: true." },
  { id: "SAST_SWALLOWED_EXCEPTION", re: /\bexcept\s*:\s*pass\b|\bcatch\s*(?:\([^)]*\))?\s*\{\s*\}/, message: "Swallowed exception block detected." }
];

export async function runSastCheck(context) {
  const findings = [];
  const reportRaw = await readTextSafe(path.join(context.targetDir, "sast-report.json"));
  if (reportRaw !== null) {
    try {
      const report = JSON.parse(reportRaw);
      if (Number(report.high ?? 0) > Number(context.config.max_high ?? 0) || Number(report.critical ?? 0) > Number(context.config.max_critical ?? 0)) {
        findings.push({ id: "SAST_REPORT_FINDINGS", high: report.high ?? 0, critical: report.critical ?? 0, message: "SAST report contains high/critical findings." });
      }
    } catch (err) {
      findings.push({ id: "INVALID_SAST_REPORT", file: "sast-report.json", message: err.message });
    }
  }

  for (const rel of context.files) {
    if (rel.includes("/fixtures/") || rel.startsWith("gates/") || rel.startsWith("scripts/") || rel.startsWith("tests/") || rel.includes(".test.") || rel.includes(".spec.")) continue;
    if (!EXTS.has(path.extname(rel))) continue;
    const src = await readTextSafe(path.resolve(context.targetDir, rel));
    if (src === null || /WEB-PROD-SAST-EXEMPT:\s+\S+/.test(src)) continue;
    for (const rule of RULES) {
      if (rule.re.test(src)) {
        findings.push({ id: rule.id, file: rel, message: rule.message });
      }
    }
  }
  return { findings };
}
