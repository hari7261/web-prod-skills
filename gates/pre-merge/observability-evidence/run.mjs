import { readFile } from "node:fs/promises";
const gate = "gates/pre-merge/observability-evidence";
const required = ["structured-logs","metrics","traces","redaction-test","alert-owner","runbook"];
const file = process.env.WEB_PROD_EVIDENCE_FILE;
const findings = [];
let manifest;
if (!file) findings.push({id:"EVIDENCE_FILE_REQUIRED",message:"Set WEB_PROD_EVIDENCE_FILE to a reviewed evidence manifest."});
else {
 try { manifest = JSON.parse(await readFile(file,"utf8")); }
 catch (e) { findings.push({id:"INVALID_EVIDENCE_FILE",message:`Cannot read/parse evidence JSON: ${e.message}`}); }
}
if (manifest) {
 if (manifest.gate !== gate) findings.push({id:"GATE_ID_MISMATCH",message:`Expected gate ${gate}.`});
 if (manifest.status !== "pass") findings.push({id:"MANIFEST_NOT_PASSING",message:"Manifest status must be pass."});
 const date = Date.parse(manifest.generated_at ?? "");
 if (!Number.isFinite(date) || date > Date.now() + 300000 || Date.now() - date > 7*86400000) findings.push({id:"STALE_OR_INVALID_EVIDENCE",message:"generated_at must be valid, not future-dated, and no older than 7 days."});
 const checks = Array.isArray(manifest.checks) ? manifest.checks : [];
 for (const id of required) {
  const item = checks.find(x => x?.id === id);
  if (!item || item.status !== "pass" || typeof item.evidence !== "string" || !item.evidence.trim()) findings.push({id:"MISSING_OR_FAILED_EVIDENCE",check:id,message:`Missing passing evidence for ${id}.`});
 }
}
const out = {gate,status:findings.length?"fail":"pass",findings,summary:findings.length?`${findings.length} evidence requirement(s) failed`:"Fresh evidence manifest is complete."};
console.log(JSON.stringify(out,null,2));
if (findings.length) { console.error(out.summary); process.exitCode=1; }
