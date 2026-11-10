#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const argv = process.argv.slice(2);
const stageIdx = argv.indexOf("--stage");
const stageFilter = stageIdx !== -1 && argv[stageIdx + 1] ? argv[stageIdx + 1] : null;
const targetIdx = argv.indexOf("--target");
const targetDir = targetIdx !== -1 && argv[targetIdx + 1] ? path.resolve(argv[targetIdx + 1]) : REPO_ROOT;

const gatesIndex = JSON.parse(await readFile(path.join(REPO_ROOT, "config", "gates.index.json"), "utf8"));
const gates = stageFilter ? gatesIndex.gates.filter((g) => g.stage === stageFilter) : gatesIndex.gates;

const results = [];
let failed = 0;

for (const gate of gates) {
  const runner = path.join(REPO_ROOT, gate.path, "run.mjs");
  const res = spawnSync(process.execPath, [runner, "--target", targetDir], {
    encoding: "utf8",
    cwd: REPO_ROOT
  });
  let parsed = null;
  try {
    parsed = JSON.parse(res.stdout);
  } catch {
    parsed = { gate: `${gate.stage}/${gate.name}`, status: res.status === 0 ? "pass" : "fail", raw: res.stdout || res.stderr };
  }
  if (res.status !== 0 || parsed.status !== "pass") failed += 1;
  results.push(parsed);
}

const report = {
  generated_at: new Date().toISOString(),
  target: targetDir,
  stage: stageFilter || "all",
  total_gates: results.length,
  passed: results.length - failed,
  failed,
  status: failed === 0 ? "pass" : "fail",
  gates: results
};

console.log(JSON.stringify(report, null, 2));
if (failed > 0) {
  console.error(`[FAIL] ${failed} of ${results.length} gate(s) failed.`);
  process.exit(1);
}
