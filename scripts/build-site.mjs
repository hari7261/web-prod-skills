import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter, parseYaml } from "./lib/yaml.mjs";

const REPO_URL = "https://github.com/hari7261/web-prod-skills";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function titleFromSlug(slug) {
  return slug
    .replace(/\.md$/i, "")
    .split(/[-_/]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function extractTitle(markdown, fallback) {
  const match = String(markdown).match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

async function listMdFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await listMdFiles(full)));
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      out.push(full.replaceAll(path.sep, "/"));
    }
  }
  return out;
}

const version = (await readFile("VERSION", "utf8")).trim();
const skillsIndex = JSON.parse(await readFile("config/skills.index.json", "utf8")).skills;
const gatesIndex = JSON.parse(await readFile("config/gates.index.json", "utf8")).gates;

const docs = {};
const pathToId = {};
const nav = [];

function registerDoc(doc) {
  docs[doc.id] = doc;
  if (doc.path) {
    pathToId[doc.path] = doc.id;
    const dir = path.posix.dirname(doc.path);
    if (doc.path.endsWith("/README.md")) {
      pathToId[dir] = doc.id;
    }
  }
}

// 1. Overview
const overviewFiles = [
  { id: "overview/readme", path: "README.md", title: "Introduction" },
  { id: "overview/agents", path: "AGENTS.md", title: "Agent Contract (AGENTS.md)" },
  { id: "overview/contributing", path: "CONTRIBUTING.md", title: "Contributing" },
  { id: "overview/changelog", path: "CHANGELOG.md", title: "Changelog" }
];
const overviewNav = [];
for (const item of overviewFiles) {
  try {
    const raw = await readFile(item.path, "utf8");
    registerDoc({
      id: item.id,
      title: item.title,
      path: item.path,
      group: "Overview",
      subgroup: "Getting Started",
      description: extractTitle(raw, item.title),
      meta: { kind: "overview", version },
      markdown: raw
    });
    overviewNav.push({ id: item.id, title: item.title });
  } catch {
    // Skip if absent
  }
}
nav.push({ group: "Overview", items: overviewNav });

// 2. Knowledge Baselines (dynamically discovered)
const knowledgePriority = ["knowledge/principles.md", "knowledge/production-readiness.md"];
const allKnowledge = await listMdFiles("knowledge");
const orderedKnowledge = [
  ...knowledgePriority.filter((p) => allKnowledge.includes(p)),
  ...allKnowledge.filter((p) => !knowledgePriority.includes(p))
];
const knowledgeNav = [];
for (const filePath of orderedKnowledge) {
  const raw = await readFile(filePath, "utf8");
  const slug = path.basename(filePath, ".md");
  const id = `knowledge/${slug}`;
  const title = extractTitle(raw, titleFromSlug(slug));
  registerDoc({
    id,
    title,
    path: filePath,
    group: "Knowledge",
    subgroup: "Engineering Baselines",
    description: `${title} — shared production baseline.`,
    meta: { kind: "knowledge" },
    markdown: raw
  });
  knowledgeNav.push({ id, title });
}
nav.push({ group: `Knowledge (${knowledgeNav.length})`, items: knowledgeNav });

// 3. Skills (dynamically loaded from config/skills.index.json)
const domainOrder = ["frontend", "backend", "ai-features", "integrations", "cross-cutting", "delivery"];
const domainLabels = {
  frontend: "Frontend",
  backend: "Backend",
  "ai-features": "AI Features",
  integrations: "Integrations",
  "cross-cutting": "Cross-Cutting",
  delivery: "Delivery"
};
const skillsByDomain = new Map(domainOrder.map((d) => [d, []]));

for (const entry of skillsIndex) {
  const parts = entry.path.split("/");
  const domain = parts[1] || "general";
  const raw = await readFile(entry.path, "utf8");
  const { frontmatter, body } = parseFrontmatter(raw);
  const id = `skills/${domain}/${entry.name}`;
  const requiresGate = Array.isArray(entry.requires_gate) ? entry.requires_gate[0] : frontmatter?.requires_gate;
  registerDoc({
    id,
    title: entry.name,
    path: entry.path,
    group: "Skills",
    subgroup: domainLabels[domain] || titleFromSlug(domain),
    description: frontmatter?.description || "",
    meta: {
      kind: "skill",
      version: frontmatter?.version || version,
      applies_to: entry.applies_to || frontmatter?.applies_to || [],
      triggers: entry.triggers || frontmatter?.triggers || [],
      requires_gate: requiresGate || ""
    },
    markdown: `# ${entry.name}\n\n${frontmatter?.description ? `> ${frontmatter.description}\n\n` : ""}${body.trim()}\n`
  });
  if (!skillsByDomain.has(domain)) skillsByDomain.set(domain, []);
  skillsByDomain.get(domain).push({ id, title: entry.name });

  for (const resRel of frontmatter?.resources || []) {
    const resPath = path.posix.join(path.posix.dirname(entry.path), resRel);
    if (!resPath.endsWith(".md")) continue;
    try {
      const resRaw = await readFile(resPath, "utf8");
      const resId = `${id}/resource/${path.basename(resPath, ".md")}`;
      registerDoc({
        id: resId,
        title: `${entry.name}: ${path.basename(resPath)}`,
        path: resPath,
        group: "Skills",
        subgroup: domainLabels[domain] || titleFromSlug(domain),
        description: `Resource for ${entry.name}`,
        meta: { kind: "resource" },
        markdown: resRaw
      });
    } catch {
      // Ignore missing optional resource
    }
  }
}

const skillSubgroups = [];
for (const [domain, items] of skillsByDomain.entries()) {
  if (items.length > 0) {
    skillSubgroups.push({ label: `${domainLabels[domain] || titleFromSlug(domain)} (${items.length})`, items });
  }
}
nav.push({ group: `Skills (${skillsIndex.length})`, subgroups: skillSubgroups });

// 4. Gates (dynamically loaded from config/gates.index.json)
const stageOrder = ["pre-commit", "pre-merge", "pre-deploy", "post-deploy"];
const stageLabels = {
  "pre-commit": "Pre-Commit",
  "pre-merge": "Pre-Merge",
  "pre-deploy": "Pre-Deploy",
  "post-deploy": "Post-Deploy"
};
const gatesByStage = new Map(stageOrder.map((s) => [s, []]));

for (const gate of gatesIndex) {
  const readmePath = `${gate.path}/README.md`;
  const configPath = `${gate.path}/config.yaml`;
  const raw = await readFile(readmePath, "utf8");
  let gateCfg = {};
  try {
    gateCfg = parseYaml(await readFile(configPath, "utf8"));
  } catch {
    gateCfg = {};
  }
  const id = `gates/${gate.stage}/${gate.name}`;
  registerDoc({
    id,
    title: gate.name,
    path: readmePath,
    group: "Gates",
    subgroup: stageLabels[gate.stage] || titleFromSlug(gate.stage),
    description: `${gate.stage}/${gate.name} (${gate.severity})`,
    meta: {
      kind: "gate",
      stage: gate.stage,
      severity: gate.severity,
      checks: gate.checks || [],
      config: gateCfg
    },
    markdown: `${raw.trim()}\n\n## Configuration (\`config.yaml\`)\n\n\`\`\`yaml\n${Object.entries(gateCfg).map(([k, v]) => `${k}: ${Array.isArray(v) ? JSON.stringify(v) : v}`).join("\n")}\n\`\`\`\n`
  });
  if (!gatesByStage.has(gate.stage)) gatesByStage.set(gate.stage, []);
  gatesByStage.get(gate.stage).push({ id, title: gate.name });
}

const gateSubgroups = [];
for (const [stage, items] of gatesByStage.entries()) {
  if (items.length > 0) {
    gateSubgroups.push({ label: `${stageLabels[stage] || titleFromSlug(stage)} (${items.length})`, items });
  }
}
nav.push({ group: `Gates (${gatesIndex.length})`, subgroups: gateSubgroups });

// 5. Templates (dynamically discovered)
const templateMds = await listMdFiles("templates");
const templatesNav = [];
for (const filePath of templateMds) {
  const raw = await readFile(filePath, "utf8");
  const rel = filePath.replace(/^templates\//, "");
  const id = `templates/${rel.replace(/\.md$/, "")}`;
  const dirPart = rel.includes("/") ? rel.split("/")[0] : "";
  const fileBase = path.basename(rel, ".md");
  const title = fileBase === "README" && dirPart
    ? titleFromSlug(dirPart)
    : dirPart
      ? `${titleFromSlug(dirPart)} · ${fileBase}`
      : titleFromSlug(fileBase);
  registerDoc({
    id,
    title,
    path: filePath,
    group: "Templates",
    subgroup: dirPart ? titleFromSlug(dirPart) : "Authoring Templates",
    description: `Template: ${filePath}`,
    meta: { kind: "template" },
    markdown: raw
  });
  templatesNav.push({ id, title });
}
nav.push({ group: `Templates (${templatesNav.length})`, items: templatesNav });

// 6. Evals (dynamically discovered)
const evalMds = await listMdFiles("evals");
const evalsNav = [];
for (const filePath of evalMds) {
  const raw = await readFile(filePath, "utf8");
  const rel = filePath.replace(/^evals\//, "");
  const id = `evals/${rel.replace(/\.md$/, "")}`;
  const title = filePath === "evals/README.md" ? "Eval Framework" : `Rubric: ${extractTitle(raw, titleFromSlug(path.basename(rel, ".md")))}`;
  registerDoc({
    id,
    title,
    path: filePath,
    group: "Evals",
    subgroup: "Golden Sets & Rubrics",
    description: `Evaluation documentation: ${filePath}`,
    meta: { kind: "eval" },
    markdown: raw
  });
  evalsNav.push({ id, title });
}

// Also generate a live Golden Sets & Baseline summary doc from evals/golden-sets & evals/baselines
try {
  const goldenDirs = (await readdir("evals/golden-sets", { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const baselineFiles = (await readdir("evals/baselines")).filter((f) => f.endsWith(".json")).sort();
  const latestBaseline = baselineFiles.length ? JSON.parse(await readFile(path.join("evals/baselines", baselineFiles[baselineFiles.length - 1]), "utf8")) : {};
  let summaryMd = `# Golden Sets & Baselines\n\nAutomatically indexed from \`evals/golden-sets/\` and \`evals/baselines/\`.\n\n## Baselines (\`${latestBaseline.version || version}\`)\n\n| Suite | Minimum Pass Rate |\n|---|---|\n`;
  for (const [k, v] of Object.entries(latestBaseline.thresholds || {})) {
    summaryMd += `| \`${k}\` | ${Number(v) * 100}% |\n`;
  }
  summaryMd += `\n- **Max avg latency:** ${latestBaseline.max_avg_latency_ms ?? "n/a"} ms\n- **Max avg cost:** $${latestBaseline.max_avg_cost_usd ?? "n/a"} USD\n\n## Golden Set Cases\n\n`;
  for (const dir of goldenDirs) {
    const lines = (await readFile(path.join("evals/golden-sets", dir, "cases.jsonl"), "utf8")).split(/\r?\n/).filter((l) => l.trim());
    summaryMd += `### \`${dir}\` (${lines.length} cases)\n\n| ID | Category | Severity | Expected |\n|---|---|---|---|\n`;
    for (const line of lines) {
      const c = JSON.parse(line);
      summaryMd += `| \`${c.id}\` | \`${c.category}\` | \`${c.severity}\` | ${c.expected.replaceAll("|", "\\|")} |\n`;
    }
    summaryMd += "\n";
  }
  const gsId = "evals/golden-sets";
  registerDoc({
    id: gsId,
    title: "Golden Sets & Baselines",
    path: "evals/golden-sets",
    group: "Evals",
    subgroup: "Golden Sets & Rubrics",
    description: "All golden evaluation suites and baseline pass thresholds.",
    meta: { kind: "eval" },
    markdown: summaryMd
  });
  evalsNav.push({ id: gsId, title: "Golden Sets & Baselines" });
} catch {
  // Ignore if absent
}
nav.push({ group: `Evals (${evalsNav.length})`, items: evalsNav });

const sha = process.env.GITHUB_SHA ?? "local";
const payload = {
  version,
  revision: sha.slice(0, 12),
  generatedAt: new Date().toISOString(),
  repoUrl: REPO_URL,
  counts: {
    docs: Object.keys(docs).length,
    knowledge: knowledgeNav.length,
    skills: skillsIndex.length,
    gates: gatesIndex.length,
    templates: templatesNav.length,
    evals: evalsNav.length
  },
  pathToId,
  nav,
  docs
};

await writeFile("docs/docs-data.json", JSON.stringify(payload));

// Update SEO/noscript fallback catalog in docs/index.html if markers are present
let html = await readFile("docs/index.html", "utf8");
const skillCards = skillsIndex.map((skill) => {
  const name = escapeHtml(skill.name);
  const p = escapeHtml(skill.path);
  const areas = escapeHtml((skill.applies_to ?? []).join(", "));
  const triggers = escapeHtml((skill.triggers ?? []).slice(0, 2).join("; "));
  const parts = skill.path.split("/");
  const docId = `skills/${parts[1]}/${skill.name}`;
  return `<article class="fallback-card"><h3>${name}</h3><p>Applies to: ${areas || "web engineering"}. ${triggers}</p><a href="#/doc/${escapeHtml(docId)}">Read ${name}</a> · <a href="${REPO_URL}/blob/main/${p}">Source</a></article>`;
}).join("\n");

const gateCards = gatesIndex.map((gate) => {
  const name = escapeHtml(gate.name);
  const p = escapeHtml(gate.path);
  const stage = escapeHtml(gate.stage);
  const severity = escapeHtml(gate.severity);
  const docId = `gates/${gate.stage}/${gate.name}`;
  return `<article class="fallback-card"><h3>${name}</h3><p>Stage: ${stage} · Severity: ${severity}</p><a href="#/doc/${escapeHtml(docId)}">Read ${name}</a> · <a href="${REPO_URL}/tree/main/${p}">Source</a></article>`;
}).join("\n");

const generatedCatalog = `<section id="skills"><h2>Indexed agent skills (${skillsIndex.length})</h2><div class="fallback-grid">${skillCards}</div></section>\n<section id="gates"><h2>Indexed engineering gates (${gatesIndex.length})</h2><div class="fallback-grid">${gateCards}</div></section>`;

const catStart = "<!-- GENERATED_CATALOG:START -->";
const catEnd = "<!-- GENERATED_CATALOG:END -->";
if (html.includes(catStart) && html.includes(catEnd)) {
  html = html.replace(
    new RegExp(`${catStart}[\\s\\S]*?${catEnd}`),
    `${catStart}\n${generatedCatalog}\n    ${catEnd}`
  );
} else if (html.includes("<!-- GENERATED_CATALOG -->")) {
  html = html.replace("<!-- GENERATED_CATALOG -->", `${catStart}\n${generatedCatalog}\n    ${catEnd}`);
}

const revStart = "<!-- BUILD_REVISION:START -->";
const revEnd = "<!-- BUILD_REVISION:END -->";
const revLine = `<p class="meta">Published v${escapeHtml(version)} from revision <code>${escapeHtml(sha.slice(0, 12))}</code>.</p>`;
if (html.includes(revStart) && html.includes(revEnd)) {
  html = html.replace(
    new RegExp(`${revStart}[\\s\\S]*?${revEnd}`),
    `${revStart}\n    ${revLine}\n    ${revEnd}`
  );
} else if (html.includes("<!-- BUILD_REVISION -->")) {
  html = html.replace("<!-- BUILD_REVISION -->", `${revStart}\n    ${revLine}\n    ${revEnd}`);
}
await writeFile("docs/index.html", html);
console.log(`Generated docs-data.json (${payload.counts.docs} docs: ${skillsIndex.length} skills, ${gatesIndex.length} gates) and updated docs/index.html.`);
