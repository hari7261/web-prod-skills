import path from "node:path";
import { readTextSafe } from "../../../../scripts/lib/files.mjs";
import { parseYaml } from "../../../../scripts/lib/yaml.mjs";

const CODE_EXTS = new Set([".js", ".mjs", ".ts", ".tsx", ".py"]);
const INLINE_PROMPT_RE = /\b(?:systemPrompt|system_prompt|promptTemplate|prompt)\s*[:=]\s*[`'"](?:You are |Act as |Always |Never )[\s\S]{40,}[`'"]/i;

export async function runPromptHygieneCheck(context) {
  const findings = [];
  for (const rel of context.files) {
    if (rel.includes("/fixtures/") || rel.startsWith("gates/") || rel.startsWith("scripts/") || rel.startsWith("evals/")) continue;
    const abs = path.resolve(context.targetDir, rel);
    const base = path.basename(rel);
    if (/(?:^|\/)prompts?\//i.test(rel) || /^prompt.*\.ya?ml$/i.test(base)) {
      const raw = await readTextSafe(abs);
      if (raw !== null) {
        const doc = parseYaml(raw);
        for (const reqKey of ["id", "version", "model", "max_tokens"]) {
          if (doc[reqKey] === undefined || doc[reqKey] === null || doc[reqKey] === "") {
            findings.push({ id: "INVALID_PROMPT_SCHEMA", file: rel, key: reqKey, message: `Prompt file '${rel}' missing required '${reqKey}'.` });
          }
        }
      }
      continue;
    }
    if (CODE_EXTS.has(path.extname(rel))) {
      const src = await readTextSafe(abs);
      if (src !== null && INLINE_PROMPT_RE.test(src) && !/WEB-PROD-PROMPT-EXEMPT:\s+\S+/.test(src)) {
        findings.push({ id: "INLINE_PROMPT_STRING", file: rel, message: "Inline production prompt detected; load from versioned prompt artifact." });
      }
    }
  }
  return { findings };
}

