import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const gatesIdx = JSON.parse(await readFile("config/gates.index.json", "utf8"));

for (const gate of gatesIdx.gates) {
  test(`gate ${gate.stage}/${gate.name} passes on pass fixture and exits 1 on fail fixture`, () => {
    const runner = path.resolve(gate.path, "run.mjs");
    const passDir = path.resolve(gate.path, "fixtures", "pass");
    const failDir = path.resolve(gate.path, "fixtures", "fail");

    const passRes = spawnSync(process.execPath, [runner, "--target", passDir], { encoding: "utf8" });
    assert.equal(passRes.status, 0, `Expected pass on ${passDir}:\n${passRes.stdout}\n${passRes.stderr}`);
    const passJson = JSON.parse(passRes.stdout);
    assert.equal(passJson.status, "pass");

    const failRes = spawnSync(process.execPath, [runner, "--target", failDir], { encoding: "utf8" });
    assert.equal(failRes.status, 1, `Expected exit 1 on ${failDir}:\n${failRes.stdout}\n${failRes.stderr}`);
    const failJson = JSON.parse(failRes.stdout);
    assert.equal(failJson.status, "fail");
    assert.ok(failJson.findings.length > 0, `Expected findings on ${failDir}`);
  });
}

