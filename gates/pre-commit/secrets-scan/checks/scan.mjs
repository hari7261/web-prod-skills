import { scanSecrets } from "../../../../scripts/scan-secrets.mjs";

export async function runSecretsCheck(context) {
  const findings = await scanSecrets({ targetDir: context.targetDir, files: context.files });
  return { findings };
}
