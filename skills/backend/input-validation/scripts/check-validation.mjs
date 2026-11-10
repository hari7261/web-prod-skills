import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gateRunner = path.resolve(__dirname, "..", "..", "..", "..", "gates", "pre-merge", "input-validation", "run.mjs");
const res = spawnSync(process.execPath, [gateRunner, ...process.argv.slice(2)], { stdio: "inherit" });
process.exit(res.status ?? 1);
