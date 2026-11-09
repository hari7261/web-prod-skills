import { readFile } from "node:fs/promises";
const gate="gates/pre-merge/llm-output-safety", required=["output-schema-tests","unsafe-sink-review","tool-authorization-tests","prompt-injection-evals","size-and-cost-bounds"], file=process.env.WEB_PROD_EVIDENCE_FILE, findings=[];
let m;
if(!file) findings.push({id:"EVIDENCE_FILE_REQUIRED",message:"Set WEB_PROD_EVIDENCE_FILE."});
else {try{m=JSON.parse(await readFile(file,"utf8"));}catch(e){findings.push({id:"INVALID_EVIDENCE_FILE",message:e.message});}}
if(m){
 if(m.gate!==gate)findings.push({id:"GATE_ID_MISMATCH",message:`Expected ${gate}.`});
 if(m.status!=="pass")findings.push({id:"MANIFEST_NOT_PASSING",message:"Manifest status must be pass."});
 const t=Date.parse(m.generated_at??"");if(!Number.isFinite(t)||t>Date.now()+300000||Date.now()-t>7*86400000)findings.push({id:"STALE_OR_INVALID_EVIDENCE",message:"Evidence must be valid, current and not future-dated."});
 const checks=Array.isArray(m.checks)?m.checks:[];for(const id of required){const c=checks.find(x=>x?.id===id);if(!c||c.status!=="pass"||typeof c.evidence!=="string"||!c.evidence.trim())findings.push({id:"MISSING_OR_FAILED_EVIDENCE",check:id,message:`Missing passing evidence: ${id}.`});}
}
const result={gate,status:findings.length?"fail":"pass",findings,summary:findings.length?`${findings.length} evidence requirement(s) failed`:"Fresh evidence manifest is complete."};
console.log(JSON.stringify(result,null,2));if(findings.length){console.error(result.summary);process.exitCode=1;}
