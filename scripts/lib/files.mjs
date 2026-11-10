import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const DEFAULT_IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage",
  ".turbo"
]);

export async function walkFiles(dir, { ignoredDirs = DEFAULT_IGNORED_DIRS, rootDir = dir } = {}) {
  const results = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (ignoredDirs.has(ent.name)) continue;
      const sub = await walkFiles(path.join(dir, ent.name), { ignoredDirs, rootDir });
      results.push(...sub);
    } else if (ent.isFile()) {
      results.push(path.relative(rootDir, path.join(dir, ent.name)).replaceAll(path.sep, "/"));
    }
  }
  return results.sort();
}

export async function getTargetFiles(targetDir, { changedEnv = process.env.WEB_PROD_CHANGED_FILES, includeFixtures = false } = {}) {
  if (changedEnv && changedEnv.trim()) {
    return changedEnv
      .split(/\r?\n/)
      .map((s) => s.trim().replaceAll("\\", "/"))
      .filter(Boolean);
  }
  const absTarget = path.resolve(targetDir);
  if (absTarget === path.resolve(process.cwd())) {
    try {
      const tracked = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8", cwd: absTarget })
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      const unique = [...new Set(tracked)];
      const existing = [];
      for (const f of unique) {
        if (!includeFixtures && f.includes("/fixtures/")) continue;
        if (await fileExists(path.join(absTarget, f))) existing.push(f);
      }
      return existing;
    } catch {
      // Fallback to directory walk
    }
  }
  const all = await walkFiles(absTarget);
  return includeFixtures ? all : all.filter((f) => !f.includes("/fixtures/"));
}

export async function readTextSafe(filePath, maxBytes = 2_000_000) {
  try {
    const info = await stat(filePath);
    if (!info.isFile() || info.size > maxBytes) return null;
    const buf = await readFile(filePath);
    if (buf.includes(0)) return null;
    return buf.toString("utf8");
  } catch {
    return null;
  }
}

export async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}
