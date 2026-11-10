#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVALS_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const opts = { report: null, baseline: path.join(EVALS_ROOT, "baselines", "v2.0.0.json") };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--report" && argv[i + 1]) opts.report = path.resolve(argv[++i]);
    else if (argv[i] === "--baseline" && argv[i + 1]) opts.baseline = path.resolve(argv[++i]);
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const baseline = JSON.parse(await readFile(opts.baseline, "utf8"));
const goldenDir = path.join(EVALS_ROOT, "golden-sets");
const suites = (await readdir(goldenDir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();

const requiredRubrics = ["correctness.md", "safety.md", "tone.md"];
const findings = [];
const suiteStats = {};
const seenIds = new Set();

for (const r of requiredRubrics) {
  try {
    const txt = await readFile(path.join(EVALS_ROOT, "rubrics", r), "utf8");
    if (!txt.trim()) findings.push({ id: "EMPTY_RUBRIC", file: `evals/rubrics/${r}`, message: "Rubric cannot be empty." });
  } catch {
    findings.push({ id: "MISSING_RUBRIC", file: `evals/rubrics/${r}`, message: "Required rubric is missing." });
  }
}

for (const suite of suites) {
  const casesPath = path.join(goldenDir, suite, "cases.jsonl");
  let raw = "";
  try {
    raw = await readFile(casesPath, "utf8");
  } catch {
    findings.push({ id: "MISSING_GOLDEN_SET", suite, message: `Missing ${casesPath}` });
    continue;
  }
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 5) {
    findings.push({ id: "INSUFFICIENT_CASES", suite, count: lines.length, message: `Golden set '${suite}' must have at least 5 cases.` });
  }
  const cases = [];
  for (let i = 0; i < lines.length; i += 1) {
    let item;
    try {
      item = JSON.parse(lines[i]);
    } catch (err) {
      findings.push({ id: "INVALID_JSONL", suite, line: i + 1, message: err.message });
      continue;
    }
    if (!item.id || !item.category || typeof item.input !== "string" || !item.expected || !item.severity) {
      findings.push({ id: "INVALID_CASE_FIELDS", suite, line: i + 1, message: "Case missing id/category/input/expected/severity." });
      continue;
    }
    if (seenIds.has(item.id)) {
      findings.push({ id: "DUPLICATE_CASE_ID", suite, caseId: item.id, message: `Duplicate case id ${item.id}` });
    }
    seenIds.add(item.id);
    cases.push(item);
  }
  suiteStats[suite] = { total: cases.length, passed: cases.length, pass_rate: 1.0 };
}

if (opts.report) {
  let report;
  try {
    report = JSON.parse(await readFile(opts.report, "utf8"));
  } catch (err) {
    findings.push({ id: "INVALID_EVAL_REPORT", message: err.message });
    report = null;
  }
  if (report) {
    const results = Array.isArray(report.results) ? report.results : [];
    for (const suite of suites) {
      const suiteCases = results.filter((r) => r.suite === suite);
      if (suiteCases.length === 0) {
        findings.push({ id: "MISSING_SUITE_RESULTS", suite, message: `Eval report has no results for suite '${suite}'.` });
        continue;
      }
      const passedCount = suiteCases.filter((r) => r.passed === true).length;
      const rate = passedCount / suiteCases.length;
      const minRate = baseline.thresholds?.[suite] ?? baseline.overall_minimum ?? 0.9;
      suiteStats[suite] = { total: suiteCases.length, passed: passedCount, pass_rate: Number(rate.toFixed(4)), threshold: minRate };
      if (rate < minRate) {
        findings.push({ id: "EVAL_REGRESSION", suite, pass_rate: rate, threshold: minRate, message: `Suite '${suite}' pass rate ${rate} is below baseline threshold ${minRate}.` });
      }
      for (const c of suiteCases) {
        if (c.passed !== true && c.severity === "block") {
          findings.push({ id: "BLOCKING_EVAL_CASE_FAILED", suite, caseId: c.id, message: `Blocking eval case '${c.id}' failed.` });
        }
      }
    }
    if (typeof report.avg_latency_ms === "number" && report.avg_latency_ms > baseline.max_avg_latency_ms) {
      findings.push({ id: "LATENCY_BUDGET_EXCEEDED", actual: report.avg_latency_ms, max: baseline.max_avg_latency_ms, message: `Avg latency ${report.avg_latency_ms}ms > ${baseline.max_avg_latency_ms}ms.` });
    }
    if (typeof report.avg_cost_usd === "number" && report.avg_cost_usd > baseline.max_avg_cost_usd) {
      findings.push({ id: "COST_BUDGET_EXCEEDED", actual: report.avg_cost_usd, max: baseline.max_avg_cost_usd, message: `Avg cost $${report.avg_cost_usd} > $${baseline.max_avg_cost_usd}.` });
    }
  }
}

const out = {
  runner: "evals/runners/run-suite.mjs",
  baseline_version: baseline.version,
  mode: opts.report ? "report-evaluation" : "suite-integrity",
  status: findings.length === 0 ? "pass" : "fail",
  suites: suiteStats,
  findings,
  summary: findings.length === 0
    ? `[PASS] Eval suite passed (${suites.length} golden sets, ${seenIds.size} cases).`
    : `[FAIL] Eval suite failed with ${findings.length} finding(s).`
};

console.log(JSON.stringify(out, null, 2));
if (findings.length) {
  console.error(out.summary);
  process.exit(1);
}

