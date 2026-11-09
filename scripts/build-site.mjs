import { readFile, writeFile } from "node:fs/promises";

const skills = JSON.parse(await readFile("config/skills.index.json", "utf8")).skills;
const gates = JSON.parse(await readFile("config/gates.index.json", "utf8")).gates;
let html = await readFile("docs/index.html", "utf8");

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

const skillCards = skills.map((skill) => {
  const name = escapeHtml(skill.name), path = escapeHtml(skill.path);
  const areas = escapeHtml((skill.applies_to ?? []).join(", "));
  const triggers = escapeHtml((skill.triggers ?? []).slice(0, 2).join("; "));
  return `<article class="card"><h3>${name}</h3><p>Applies to: ${areas || "web engineering"}.</p><p>${triggers}</p><a href="https://github.com/hari7261/web-prod-skills/blob/main/${path}">Read skill →</a></article>`;
}).join("\n");

const gateCards = gates.map((gate) => {
  const name = escapeHtml(gate.name), path = escapeHtml(gate.path);
  const stage = escapeHtml(gate.stage), severity = escapeHtml(gate.severity);
  return `<article class="card"><h3>${name}</h3><p>Stage: ${stage} · Severity: ${severity}</p><a href="https://github.com/hari7261/web-prod-skills/tree/main/${path}">Read gate →</a></article>`;
}).join("\n");

const generated = `
<section id="skills"><h2>Indexed agent skills (${skills.length})</h2><div class="grid">${skillCards}</div></section>
<section id="gates"><h2>Indexed engineering gates (${gates.length})</h2><div class="grid">${gateCards}</div></section>
`;
const marker = "<!-- GENERATED_CATALOG -->";
if (!html.includes(marker)) throw new Error("docs/index.html is missing GENERATED_CATALOG marker");
html = html.replace(marker, generated);
const sha = process.env.GITHUB_SHA ?? "local";
html = html.replace("<!-- BUILD_REVISION -->", `<p class="meta">Published from repository revision <code>${escapeHtml(sha.slice(0, 12))}</code>.</p>`);
await writeFile("docs/index.html", html);
console.log(`Generated catalog: ${skills.length} skills, ${gates.length} gates.`);
