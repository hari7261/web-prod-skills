/**
 * Minimal deterministic YAML parser for config.yaml, severity-levels.yaml, and SKILL.md frontmatter.
 * Supports mappings, sequences (both inline [...] and '- item' blocks), booleans, numbers, and quoted strings.
 */

function parseScalar(raw) {
  const s = raw.trim();
  if (s === "" || s === "null" || s === "~") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s);
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (s.startsWith("[") && s.endsWith("]")) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((part) => parseScalar(part));
  }
  return s;
}

function stripComment(line) {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === "#" && !inSingle && !inDouble && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
}

export function parseYaml(text) {
  const rawLines = String(text).replace(/\r\n/g, "\n").split("\n");
  const tokens = [];
  for (const raw of rawLines) {
    const cleaned = stripComment(raw);
    if (!cleaned.trim()) continue;
    const indent = cleaned.match(/^ */)[0].length;
    tokens.push({ indent, text: cleaned.trim() });
  }

  let idx = 0;

  function parseBlock(minIndent) {
    if (idx >= tokens.length) return {};
    const first = tokens[idx];
    if (first.text.startsWith("- ")) {
      return parseList(first.indent);
    }
    return parseMap(minIndent);
  }

  function parseList(listIndent) {
    const arr = [];
    while (idx < tokens.length) {
      const tok = tokens[idx];
      if (tok.indent < listIndent || !tok.text.startsWith("- ")) break;
      const rest = tok.text.slice(2).trim();
      idx += 1;
      if (!rest) {
        if (idx < tokens.length && tokens[idx].indent > tok.indent) {
          arr.push(parseBlock(tokens[idx].indent));
        } else {
          arr.push(null);
        }
      } else if (/^[A-Za-z0-9_.-]+\s*:/.test(rest)) {
        const colon = rest.indexOf(":");
        const k = rest.slice(0, colon).trim();
        const vRaw = rest.slice(colon + 1).trim();
        const obj = {};
        obj[k] = vRaw ? parseScalar(vRaw) : (idx < tokens.length && tokens[idx].indent > tok.indent ? parseBlock(tokens[idx].indent) : null);
        while (idx < tokens.length && tokens[idx].indent > tok.indent && !tokens[idx].text.startsWith("- ")) {
          const sub = tokens[idx];
          const c = sub.text.indexOf(":");
          if (c === -1) break;
          const sk = sub.text.slice(0, c).trim();
          const sv = sub.text.slice(c + 1).trim();
          idx += 1;
          obj[sk] = sv ? parseScalar(sv) : (idx < tokens.length && tokens[idx].indent > sub.indent ? parseBlock(tokens[idx].indent) : {});
        }
        arr.push(obj);
      } else {
        arr.push(parseScalar(rest));
      }
    }
    return arr;
  }

  function parseMap(mapIndent) {
    const obj = {};
    while (idx < tokens.length) {
      const tok = tokens[idx];
      if (tok.indent < mapIndent || tok.text.startsWith("- ")) break;
      const colon = tok.text.indexOf(":");
      if (colon === -1) {
        idx += 1;
        continue;
      }
      const key = tok.text.slice(0, colon).trim();
      const valRaw = tok.text.slice(colon + 1).trim();
      idx += 1;
      if (valRaw !== "") {
        obj[key] = parseScalar(valRaw);
      } else if (idx < tokens.length && tokens[idx].indent > tok.indent) {
        obj[key] = parseBlock(tokens[idx].indent);
      } else if (idx < tokens.length && tokens[idx].indent === tok.indent && tokens[idx].text.startsWith("- ")) {
        obj[key] = parseList(tokens[idx].indent);
      } else {
        obj[key] = {};
      }
    }
    return obj;
  }

  return parseBlock(0);
}

export function parseFrontmatter(markdown) {
  const normalized = String(markdown).replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return { frontmatter: null, body: normalized };
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) return { frontmatter: null, body: normalized };
  const yamlText = normalized.slice(4, end);
  const body = normalized.slice(end + 5);
  return { frontmatter: parseYaml(yamlText), body };
}

