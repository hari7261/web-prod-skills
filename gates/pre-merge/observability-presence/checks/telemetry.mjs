import { checkTelemetry } from "../../../../scripts/check-telemetry.mjs";

export async function runObservabilityCheck(context) {
  const findings = await checkTelemetry({ targetDir: context.targetDir, files: context.files });
  return { findings };
}
