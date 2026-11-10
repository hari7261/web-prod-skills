#!/usr/bin/env node
import path from "node:path";
import { getTargetFiles, readTextSafe } from "../../../../scripts/lib/files.mjs";

const targetIdx = process.argv.indexOf("--target");
const targetDir = targetIdx !== -1 && process.argv[targetIdx + 1] ? path.resolve(process.argv[targetIdx + 1]) : process.cwd();
const files = await getTargetFiles(targetDir);
const findings = [];

for (const rel of files) {
  if (rel.includes("/fixtures/") || rel.startsWith("gates/") || rel.startsWith("scripts/") || rel.startsWith("skills/") || rel.includes(".test.")) continue;
  if (!/\.(?:js|mjs|ts|tsx|py|go)$/.test(rel)) continue;
  const src = await readTextSafe(path.resolve(targetDir, rel));
  if (!src || !/webhook/i.test(src)) continue;
  if (!/(?:timingSafeEqual|verifyWebhookSignature|hmac\.compare_digest|hmac\.Equal)/.test(src)) {
    findings.push({ id: "WEBHOOK_MISSING_CONSTANT_TIME_SIG", file: rel, message: "Webhook file lacks constant-time signature verification." });
  }
  if (!/(?:timestamp|skew|replay|event\.id|idempotency)/i.test(src)) {
    findings.push({ id: "WEBHOOK_MISSING_REPLAY_DEFENSE", file: rel, message: "Webhook file lacks timestamp skew or event-ID replay defense." });
  }
}

const out = { check: "check-webhook-safety", status: findings.length ? "fail" : "pass", findings };
console.log(JSON.stringify(out, null, 2));
if (findings.length) process.exit(1);
