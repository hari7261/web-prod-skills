#!/usr/bin/env node
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--") && argv[i + 1]) {
      opts[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const type = opts.type;

if (!type || !["skill", "gate"].includes(type)) {
  console.error("Usage: node scripts/scaffold.mjs --type <skill|gate> --name <name> [--domain <domain>] [--stage <stage>] [--gate <gate-path>] [--out <dir>]");
  process.exit(2);
}

const baseOut = opts.out ? path.resolve(opts.out) : process.cwd();

if (type === "skill") {
  const domain = opts.domain || "backend";
  const name = opts.name;
  const reqGate = opts.gate || "gates/pre-merge/input-validation";
  if (!name) {
    console.error("--name is required");
    process.exit(2);
  }
  const skillDir = path.join(baseOut, "skills", domain, name);
  try {
    await access(skillDir);
    console.error(`Directory already exists: ${skillDir}`);
    process.exit(1);
  } catch {
    // OK
  }
  await mkdir(path.join(skillDir, "resources"), { recursive: true });
  await mkdir(path.join(skillDir, "scripts"), { recursive: true });
  const content = `---
name: ${name}
version: 2.0.0
description: Production standard for ${name.replaceAll("-", " ")}.
applies_to: [${domain}]
triggers:
  - implementing or modifying ${name.replaceAll("-", " ")}
requires_gate: ${reqGate}
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever ${name.replaceAll("-", " ")} behavior is added or modified. Do not skip for prototypes shipped to production.

## 2. Non-negotiables

- Enforce explicit invariants at the trust boundary.
- Emit structured telemetry and handle failure paths safely.

## 3. Rejection criteria

Fail the task if non-negotiables are bypassed or gate evidence is missing.

## 4. Step-by-step procedure

1. Review applicable knowledge baselines.
2. Implement using repository templates.
3. Add negative and boundary tests.
4. Execute \`${reqGate}\` and attach JSON output.

## 5. Evidence required

Passing JSON output from \`${reqGate}\` plus automated runtime test evidence.

## 6. Anti-patterns

- **REJECT:** shipping unverified demo logic without tests or gate proof.

## 7. References

- [Principles](../../../knowledge/principles.md)
- [Production readiness](../../../knowledge/production-readiness.md)
`;
  await writeFile(path.join(skillDir, "SKILL.md"), content);
  console.log(`Scaffolded skill at ${skillDir}`);
} else {
  const stage = opts.stage || "pre-merge";
  const name = opts.name;
  if (!name) {
    console.error("--name is required");
    process.exit(2);
  }
  const gateDir = path.join(baseOut, "gates", stage, name);
  try {
    await access(gateDir);
    console.error(`Directory already exists: ${gateDir}`);
    process.exit(1);
  } catch {
    // OK
  }
  await mkdir(path.join(gateDir, "checks"), { recursive: true });
  await mkdir(path.join(gateDir, "fixtures", "pass"), { recursive: true });
  await mkdir(path.join(gateDir, "fixtures", "fail"), { recursive: true });
  await writeFile(path.join(gateDir, "config.yaml"), `version: 1\nseverity: block\n`);
  await writeFile(path.join(gateDir, "README.md"), `# ${stage}/${name}\n\n## Production-readiness items enforced\n- Correctness\n\n## Inputs\n- Target directory files\n\n## Pass criteria\n- Zero findings.\n\n## Failure message format\n- Emits JSON with \`status: "fail"\` and exits 1.\n\n## How to run\n\`\`\`sh\nnode gates/${stage}/${name}/run.mjs\n\`\`\`\n`);
  await writeFile(path.join(gateDir, "checks", "default.mjs"), `export async function runCheck() {\n  return { findings: [], summary: "Check passed." };\n}\n`);
  await writeFile(path.join(gateDir, "run.mjs"), `import path from "node:path";\nimport { fileURLToPath } from "node:url";\nimport { runGate } from "../../../scripts/lib/gate-runner.mjs";\nimport { runCheck } from "./checks/default.mjs";\n\nconst gateDir = path.dirname(fileURLToPath(import.meta.url));\nawait runGate({ gateDir, gateId: "${stage}/${name}", stage: "${stage}", checks: [{ id: "default", run: runCheck }] });\n`);
  console.log(`Scaffolded gate at ${gateDir}`);
}

