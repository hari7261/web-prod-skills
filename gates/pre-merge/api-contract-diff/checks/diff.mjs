import { checkContractDiff } from "../../../../scripts/contract-diff.mjs";

export async function runContractDiffCheck(context) {
  const findings = await checkContractDiff({ targetDir: context.targetDir });
  return { findings };
}
