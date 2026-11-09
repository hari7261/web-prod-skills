#!/usr/bin/env bash
set -Eeuo pipefail
VERSION="${WEB_PROD_SKILLS_VERSION:-v1.0.0}"
TARGET="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --version) VERSION="${2:?missing version}"; shift 2 ;;
    --target) TARGET="${2:?missing target directory}"; shift 2 ;;
    -h|--help) echo "Usage: install.sh [--version v1.0.0] [--target ./]"; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done
command -v git >/dev/null 2>&1 || { echo "git is required." >&2; exit 1; }
ROOT="$(cd "$TARGET" && pwd)"
DEST="$ROOT/.web-prod-skills"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
if [[ -e "$DEST" ]]; then echo "$DEST already exists; remove it before reinstalling." >&2; exit 1; fi
git clone --quiet --depth 1 --branch "$VERSION" https://github.com/hari7261/web-prod-skills.git "$TMP/repo"
mkdir -p "$DEST"
cp -R "$TMP/repo/skills" "$TMP/repo/gates" "$TMP/repo/knowledge" "$TMP/repo/config" "$TMP/repo/templates" "$DEST/"
cp "$TMP/repo/LICENSE" "$DEST/LICENSE"
cp "$TMP/repo/CHANGELOG.md" "$DEST/CHANGELOG.md"
cp "$TMP/repo/AGENTS.md" "$DEST/AGENTS.md"
MARKER="<!-- WEB-PROD-SKILLS:BEGIN -->"
if [[ ! -f "$ROOT/AGENTS.md" ]] || ! grep -Fq "$MARKER" "$ROOT/AGENTS.md"; then
  {
    [[ -f "$ROOT/AGENTS.md" ]] && cat "$ROOT/AGENTS.md" || printf '# Project agent instructions\n'
    cat <<'EOF'

<!-- WEB-PROD-SKILLS:BEGIN -->
## Web Prod Skills (installed at .web-prod-skills/)

For web application, backend, frontend, integration, security, database, observability, or AI feature work:
1. Read .web-prod-skills/AGENTS.md.
2. Read .web-prod-skills/knowledge/principles.md and .web-prod-skills/knowledge/production-readiness.md.
3. Select applicable skills from .web-prod-skills/config/skills.index.json and load their SKILL.md files.
4. Review applicable gates in .web-prod-skills/config/gates.index.json.
5. Never claim a gate passed unless it was executed; static heuristics and evidence manifests are not runtime proof.
<!-- WEB-PROD-SKILLS:END -->
EOF
  } > "$ROOT/AGENTS.md.tmp"
  mv "$ROOT/AGENTS.md.tmp" "$ROOT/AGENTS.md"
fi
cat <<EOF
Web Prod Skills $VERSION installed into $DEST

Next:
1. Commit .web-prod-skills/ and the AGENTS.md integration block.
2. Ask your coding agent to read .web-prod-skills/AGENTS.md.
3. Review gate limitations before adopting gates as required CI checks.

This installs skills, guidance, templates and gate runners. It does not configure app-specific CI or runtime tests.
EOF
