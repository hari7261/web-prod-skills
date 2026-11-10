import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, stat, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

test("eval suite passes integrity check and fails on blocking regression report", () => {
  const runner = path.resolve("evals/runners/run-suite.mjs");
  const ok = spawnSync(process.execPath, [runner], { encoding: "utf8" });
  assert.equal(ok.status, 0, ok.stdout + "\n" + ok.stderr);
  const okJson = JSON.parse(ok.stdout);
  assert.equal(okJson.status, "pass");

  const failReport = path.resolve("gates/pre-merge/prompt-evals/fixtures/fail/eval-report.json");
  const bad = spawnSync(process.execPath, [runner, "--report", failReport], { encoding: "utf8" });
  assert.equal(bad.status, 1);
  const badJson = JSON.parse(bad.stdout);
  assert.equal(badJson.status, "fail");
});

test("scaffold.mjs creates compliant skill and gate skeletons", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "wps-scaffold-"));
  try {
    const r1 = spawnSync(process.execPath, [
      "scripts/scaffold.mjs",
      "--type", "skill",
      "--domain", "backend",
      "--name", "demo-skill",
      "--out", tmp
    ], { encoding: "utf8" });
    assert.equal(r1.status, 0, r1.stderr);
    const skillMd = await readFile(path.join(tmp, "skills/backend/demo-skill/SKILL.md"), "utf8");
    assert.match(skillMd, /name: demo-skill/);

    const r2 = spawnSync(process.execPath, [
      "scripts/scaffold.mjs",
      "--type", "gate",
      "--stage", "pre-merge",
      "--name", "demo-gate",
      "--out", tmp
    ], { encoding: "utf8" });
    assert.equal(r2.status, 0, r2.stderr);
    await stat(path.join(tmp, "gates/pre-merge/demo-gate/run.mjs"));
    await stat(path.join(tmp, "gates/pre-merge/demo-gate/config.yaml"));
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test("webhook safety script detects missing signature/replay defenses on unsafe webhook code", async () => {
  const script = path.resolve("skills/integrations/webhook-handling/scripts/check-webhook-safety.mjs");
  const passRes = spawnSync(process.execPath, [script, "--target", path.resolve("templates/integration-client")], { encoding: "utf8" });
  assert.equal(passRes.status, 0, passRes.stdout + "\n" + passRes.stderr);
});
