import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat, readdir } from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter } from "../scripts/lib/yaml.mjs";

const REQUIRED_SECTIONS = [
  "## 1. When to use / when not to use",
  "## 2. Non-negotiables",
  "## 3. Rejection criteria",
  "## 4. Step-by-step procedure",
  "## 5. Evidence required",
  "## 6. Anti-patterns",
  "## 7. References"
];

const EXPECTED_KNOWLEDGE = [
  "principles.md",
  "production-readiness.md",
  "web-security-baseline.md",
  "reliability-baseline.md",
  "ai-feature-baseline.md",
  "frontend-baseline.md",
  "backend-baseline.md",
  "integration-baseline.md",
  "anti-patterns.md",
  "review-checklist.md",
  "glossary.md"
];

const EXPECTED_TEMPLATES = [
  "frontend-app",
  "backend-service",
  "ai-endpoint",
  "integration-client",
  "migration",
  "feature-flag",
  "runbook",
  "adr"
];

test("all 11 knowledge files exist and are non-empty", async () => {
  for (const file of EXPECTED_KNOWLEDGE) {
    const content = await readFile(path.join("knowledge", file), "utf8");
    assert.ok(content.trim().length > 50, `knowledge/${file} must be populated`);
  }
});

test("all 8 template directories exist and contain README.md", async () => {
  for (const dir of EXPECTED_TEMPLATES) {
    const info = await stat(path.join("templates", dir, "README.md"));
    assert.ok(info.isFile(), `templates/${dir}/README.md missing`);
  }
});

test("all 49 indexed skills match filesystem, frontmatter contract, and 7 ordered sections", async () => {
  const skillsIdx = JSON.parse(await readFile("config/skills.index.json", "utf8"));
  const gatesIdx = JSON.parse(await readFile("config/gates.index.json", "utf8"));
  const validGates = new Set(gatesIdx.gates.map((g) => g.path));

  assert.equal(skillsIdx.skills.length, 49, "Expected 49 indexed skills");

  const indexedPaths = new Set();
  for (const entry of skillsIdx.skills) {
    indexedPaths.add(entry.path.replaceAll("\\", "/"));
    const md = await readFile(entry.path, "utf8");
    const { frontmatter, body } = parseFrontmatter(md);
    assert.ok(frontmatter, `${entry.path} missing YAML frontmatter`);
    assert.equal(frontmatter.name, entry.name, `${entry.path} name mismatch`);
    assert.ok(frontmatter.version, `${entry.path} missing version`);
    assert.ok(frontmatter.description, `${entry.path} missing description`);
    assert.ok(Array.isArray(frontmatter.applies_to) && frontmatter.applies_to.length > 0, `${entry.path} missing applies_to`);
    assert.ok(Array.isArray(frontmatter.triggers) && frontmatter.triggers.length > 0, `${entry.path} missing triggers`);
    assert.ok(validGates.has(frontmatter.requires_gate), `${entry.path} requires unknown gate: ${frontmatter.requires_gate}`);

    for (const resPath of frontmatter.resources || []) {
      await stat(path.join(path.dirname(entry.path), resPath));
    }
    for (const scriptPath of frontmatter.scripts || []) {
      await stat(path.join(path.dirname(entry.path), scriptPath));
    }

    let lastPos = -1;
    for (const heading of REQUIRED_SECTIONS) {
      const pos = body.indexOf(heading);
      assert.ok(pos > lastPos, `${entry.path} missing or misordered heading: ${heading}`);
      lastPos = pos;
    }
  }

  // Ensure no orphan skills exist on disk
  const domains = await readdir("skills", { withFileTypes: true });
  for (const dom of domains) {
    if (!dom.isDirectory()) continue;
    const skillDirs = await readdir(path.join("skills", dom.name), { withFileTypes: true });
    for (const sd of skillDirs) {
      if (!sd.isDirectory()) continue;
      const rel = `skills/${dom.name}/${sd.name}/SKILL.md`;
      assert.ok(indexedPaths.has(rel), `Orphan skill directory not in config/skills.index.json: ${rel}`);
    }
  }
});

test("all 27 indexed gates match filesystem contract", async () => {
  const gatesIdx = JSON.parse(await readFile("config/gates.index.json", "utf8"));
  assert.equal(gatesIdx.gates.length, 27, "Expected 27 indexed gates");

  const indexedPaths = new Set();
  for (const g of gatesIdx.gates) {
    indexedPaths.add(g.path);
    await stat(path.join(g.path, "README.md"));
    await stat(path.join(g.path, "run.mjs"));
    await stat(path.join(g.path, "config.yaml"));
    const checks = await readdir(path.join(g.path, "checks"));
    assert.ok(checks.length > 0, `${g.path}/checks/ must not be empty`);
    const passFixtures = await readdir(path.join(g.path, "fixtures", "pass"));
    const failFixtures = await readdir(path.join(g.path, "fixtures", "fail"));
    assert.ok(passFixtures.length > 0, `${g.path}/fixtures/pass must not be empty`);
    assert.ok(failFixtures.length > 0, `${g.path}/fixtures/fail must not be empty`);
  }

  const stages = await readdir("gates", { withFileTypes: true });
  for (const st of stages) {
    if (!st.isDirectory()) continue;
    const gateDirs = await readdir(path.join("gates", st.name), { withFileTypes: true });
    for (const gd of gateDirs) {
      if (!gd.isDirectory()) continue;
      const rel = `gates/${st.name}/${gd.name}`;
      assert.ok(indexedPaths.has(rel), `Orphan gate directory not in config/gates.index.json: ${rel}`);
    }
  }
});

