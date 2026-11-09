import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const runner = path.resolve("gates/pre-merge/ai-eval-evidence/run.mjs");
test("evidence gate blocks when no manifest is supplied", () => {
 const r=spawnSync(process.execPath,[runner],{encoding:"utf8",env:{...process.env,WEB_PROD_EVIDENCE_FILE:""}});
 assert.equal(r.status,1);
 assert.match(r.stdout,/EVIDENCE_FILE_REQUIRED/);
});
test("evidence gate accepts a fresh complete manifest", async () => {
 const dir=await mkdtemp(path.join(tmpdir(),"web-prod-eval-"));
 try {
  const ids=["prompt-version","dataset-version","eval-run-url","quality-metrics","safety-metrics","latency-cost-metrics","reviewer"];
  const manifest={gate:"gates/pre-merge/ai-eval-evidence",status:"pass",generated_at:new Date().toISOString(),checks:ids.map(id=>({id,status:"pass",evidence:"test-fixture-reference"}))};
  const file=path.join(dir,"evidence.json"); await writeFile(file,JSON.stringify(manifest));
  const r=spawnSync(process.execPath,[runner],{encoding:"utf8",env:{...process.env,WEB_PROD_EVIDENCE_FILE:file}});
  assert.equal(r.status,0,r.stdout+"\n"+r.stderr);
  assert.match(r.stdout,/"status": "pass"/);
 } finally { await rm(dir,{recursive:true,force:true}); }
});
test("evidence gate rejects stale evidence", async () => {
 const dir=await mkdtemp(path.join(tmpdir(),"web-prod-stale-"));
 try {
  const ids=["prompt-version","dataset-version","eval-run-url","quality-metrics","safety-metrics","latency-cost-metrics","reviewer"];
  const manifest={gate:"gates/pre-merge/ai-eval-evidence",status:"pass",generated_at:"2020-01-01T00:00:00.000Z",checks:ids.map(id=>({id,status:"pass",evidence:"fixture"}))};
  const file=path.join(dir,"evidence.json"); await writeFile(file,JSON.stringify(manifest));
  const r=spawnSync(process.execPath,[runner],{encoding:"utf8",env:{...process.env,WEB_PROD_EVIDENCE_FILE:file}});
  assert.equal(r.status,1); assert.match(r.stdout,/STALE_OR_INVALID_EVIDENCE/);
 } finally { await rm(dir,{recursive:true,force:true}); }
});
