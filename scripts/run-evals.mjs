#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

export function runEvalsCli(extraArgs = []) {
  const runner = path.join(REPO_ROOT, "evals", "runners", "run-suite.mjs");
  const res = spawnSync(process.execPath, [runner, ...extraArgs], {
    encoding: "utf8",
    cwd: REPO_ROOT
  });
  return res;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const res = runEvalsCli(process.argv.slice(2));
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  process.exit(res.status ?? 1);
}

