---
name: dependency-supply-chain
version: 2.0.0
description: Pin dependencies, eliminate high/critical CVEs, and maintain lockfiles and SBOM provenance.
applies_to: [web, security, delivery]
triggers:
  - adding, upgrading, or removing npm/pip/go dependencies
  - reviewing lockfiles, vulnerability scans, or SBOMs
requires_gate: gates/pre-merge/dependency-audit
resources: []
scripts: []
---

## 1. When to use / when not to use

Use whenever modifying `package.json`, lockfiles, container base images, or third-party scripts.

## 2. Non-negotiables

- Pin exact dependency versions in manifests (`"3.23.8"`, not `^`, `~`, `*`, or `latest`) and commit lockfiles (`package-lock.json` / `pnpm-lock.yaml`).
- Zero unresolved high or critical vulnerabilities in production dependencies.
- Maintain an up-to-date SBOM (`sbom.json`) when external dependencies are shipped.
- Avoid unvetted postinstall scripts and verify package integrity hashes in CI (`npm ci`).

## 3. Rejection criteria

Fail the task if unpinned version ranges (`^`, `~`, `*`), missing lockfile/SBOM, or high/critical vulnerabilities cause `gates/pre-merge/dependency-audit` to fail.

## 4. Step-by-step procedure

1. Evaluate package maintenance, license, and bundle size before adding.
2. Pin exact version and regenerate lockfile + `sbom.json`.
3. Run vulnerability audit (`npm audit` / `audit-report.json`).
4. Run `gates/pre-merge/dependency-audit` and attach JSON output.

## 5. Evidence required

Passing `gates/pre-merge/dependency-audit` JSON output, committed lockfile, and updated SBOM.

## 6. Anti-patterns

- **REJECT:** `"lodash": "*"` or `"latest"` in `package.json`.
- **REJECT:** Ignoring `npm audit` critical findings without documented mitigation/override.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [Dependency audit gate](../../../gates/pre-merge/dependency-audit/README.md)

