#!/usr/bin/env node
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readTextSafe, walkFiles } from "./lib/files.mjs";

export async function checkBundleBudget({ targetDir = process.cwd(), maxRouteJsKb = 250, maxTotalJsKb = 800, maxRegressionPct = 10 } = {}) {
  const findings = [];
  const manifestPath = path.join(targetDir, "bundle-report.json");
  const manifestRaw = await readTextSafe(manifestPath);

  if (manifestRaw !== null) {
    let report;
    try {
      report = JSON.parse(manifestRaw);
    } catch (err) {
      return [{ id: "INVALID_BUNDLE_REPORT", file: "bundle-report.json", message: err.message }];
    }
    const routes = Array.isArray(report.routes) ? report.routes : [];
    for (const route of routes) {
      const kb = Number(route.jsKb ?? 0);
      const baselineKb = route.baselineKb !== undefined ? Number(route.baselineKb) : null;
      if (kb > maxRouteJsKb) {
        findings.push({ id: "ROUTE_BUNDLE_OVER_BUDGET", route: route.path, jsKb: kb, budgetKb: maxRouteJsKb, message: `Route ${route.path} JS (${kb} KB) exceeds ${maxRouteJsKb} KB budget.` });
      }
      if (baselineKb && baselineKb > 0) {
        const pct = ((kb - baselineKb) / baselineKb) * 100;
        if (pct > maxRegressionPct) {
          findings.push({ id: "BUNDLE_REGRESSION_EXCEEDED", route: route.path, regressionPct: Number(pct.toFixed(2)), maxRegressionPct, message: `Route ${route.path} grew by ${pct.toFixed(1)}% (> ${maxRegressionPct}%).` });
        }
      }
    }
    if (typeof report.totalJsKb === "number" && report.totalJsKb > maxTotalJsKb) {
      findings.push({ id: "TOTAL_BUNDLE_OVER_BUDGET", totalJsKb: report.totalJsKb, budgetKb: maxTotalJsKb, message: `Total JS (${report.totalJsKb} KB) exceeds ${maxTotalJsKb} KB.` });
    }
    return findings;
  }

  for (const buildSubdir of ["dist", "build", ".next/static"]) {
    const dir = path.join(targetDir, buildSubdir);
    const files = await walkFiles(dir, { ignoredDirs: new Set() });
    let totalBytes = 0;
    for (const rel of files) {
      if (!/\.(?:js|mjs)$/.test(rel)) continue;
      const info = await stat(path.join(dir, rel));
      const kb = info.size / 1024;
      totalBytes += info.size;
      if (kb > maxRouteJsKb) {
        findings.push({ id: "ASSET_OVER_BUDGET", file: `${buildSubdir}/${rel}`, jsKb: Number(kb.toFixed(2)), budgetKb: maxRouteJsKb, message: `Bundle chunk ${rel} (${kb.toFixed(1)} KB) exceeds ${maxRouteJsKb} KB.` });
      }
    }
    const totalKb = totalBytes / 1024;
    if (totalKb > maxTotalJsKb) {
      findings.push({ id: "TOTAL_BUNDLE_OVER_BUDGET", dir: buildSubdir, totalJsKb: Number(totalKb.toFixed(2)), budgetKb: maxTotalJsKb, message: `Total JS in ${buildSubdir} (${totalKb.toFixed(1)} KB) exceeds ${maxTotalJsKb} KB.` });
    }
  }
  return findings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const targetIdx = process.argv.indexOf("--target");
  const targetDir = targetIdx !== -1 && process.argv[targetIdx + 1] ? path.resolve(process.argv[targetIdx + 1]) : process.cwd();
  const findings = await checkBundleBudget({ targetDir });
  console.log(JSON.stringify({ tool: "check-bundle", status: findings.length ? "fail" : "pass", findings }, null, 2));
  if (findings.length) process.exit(1);
}

