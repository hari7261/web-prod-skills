import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";

const UI_EXTS = new Set([".jsx", ".tsx", ".vue", ".svelte"]);

export async function runAccessibilityCheck(context) {
  const findings = [];
  const reportRaw = await readTextSafe(path.join(context.targetDir, "a11y-report.json"));
  if (reportRaw !== null) {
    try {
      const report = JSON.parse(reportRaw);
      const maxViol = Number(context.config.max_violations ?? 0);
      if (Number(report.violations ?? 0) > maxViol) {
        findings.push({ id: "WCAG_AA_VIOLATIONS", violations: report.violations, message: `${report.violations} WCAG AA accessibility violation(s) found.` });
      }
    } catch (err) {
      findings.push({ id: "INVALID_A11Y_REPORT", file: "a11y-report.json", message: err.message });
    }
  }

  for (const rel of context.files) {
    if (rel.includes("/fixtures/") || rel.startsWith("templates/")) continue;
    if (!UI_EXTS.has(path.extname(rel))) continue;
    const src = await readTextSafe(path.resolve(context.targetDir, rel));
    if (src === null) continue;
    if (/<(?:div|span)\b[^>]*onClick=/i.test(src) && !/role=|tabIndex/.test(src)) {
      findings.push({ id: "NON_SEMANTIC_CLICKABLE", file: rel, message: "Clickable div/span lacks button element or keyboard role/tabIndex." });
    }
    if (/<img\b(?![^>]*\balt=)[^>]*>/i.test(src)) {
      findings.push({ id: "IMAGE_MISSING_ALT", file: rel, message: "<img> element is missing alt attribute." });
    }
  }
  return { findings };
}
