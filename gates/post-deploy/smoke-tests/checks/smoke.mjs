import { runSmokeChecks } from "../../../../scripts/smoke-test.mjs";

export async function runSmokeGateCheck(context) {
  const findings = await runSmokeChecks({
    targetDir: context.targetDir,
    timeoutMs: Number(context.config.timeout_ms ?? 5000)
  });
  return { findings };
}

