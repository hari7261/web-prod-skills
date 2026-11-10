const state = {
  data: null,
  flatOrder: [],
  currentId: "overview/readme",
  searchIndex: [],
  selectedSearchIdx: 0,
  observer: null
};

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

function isSafeUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed, "https://example.invalid");
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizePosix(baseFile, relHref) {
  const clean = relHref.split("#")[0].split("?")[0];
  if (!clean) return "";
  const baseParts = baseFile.includes("/") ? baseFile.split("/").slice(0, -1) : [];
  const stack = [...baseParts];
  for (const seg of clean.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") stack.pop();
    else stack.push(seg);
  }
  return stack.join("/");
}

function resolveDocLink(href, currentDocPath) {
  const raw = String(href || "").trim();
  if (!raw) return null;
  if (raw.startsWith("#/doc/")) return { internalId: raw.slice(6) };
  if (raw.startsWith("#")) return { anchor: raw.slice(1) };

  const repoPrefix = `${state.data?.repoUrl || ""}/`;
  if (raw.startsWith(repoPrefix)) {
    const sub = raw.slice(repoPrefix.length).replace(/^(?:blob|tree)\/main\//, "");
    const mapped = state.data?.pathToId?.[sub];
    if (mapped) return { internalId: mapped };
  }

  if (/^https?:\/\//i.test(raw)) {
    return isSafeUrl(raw) ? { externalUrl: raw } : null;
  }
  if (/^(?:javascript|data|vbscript):/i.test(raw)) return null;

  const resolvedPath = normalizePosix(currentDocPath || "README.md", raw);
  const direct = state.data?.pathToId?.[resolvedPath] || state.data?.pathToId?.[raw];
  if (direct) return { internalId: direct };

  const fallback = `${state.data?.repoUrl || "https://github.com/hari7261/web-prod-skills"}/blob/main/${resolvedPath}`;
  return { externalUrl: fallback };
}

function renderInline(text, currentDocPath) {
  const frag = document.createDocumentFragment();
  const src = String(text || "");
  const tokenRe = /(`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m;

  while ((m = tokenRe.exec(src)) !== null) {
    if (m.index > last) {
      frag.appendChild(document.createTextNode(src.slice(last, m.index)));
    }
    const tok = m[0];
    if (tok.startsWith("`") && tok.endsWith("`")) {
      frag.appendChild(el("code", null, tok.slice(1, -1)));
    } else if (tok.startsWith("**") && tok.endsWith("**")) {
      const strong = el("strong");
      strong.appendChild(renderInline(tok.slice(2, -2), currentDocPath));
      frag.appendChild(strong);
    } else if (tok.startsWith("~~") && tok.endsWith("~~")) {
      const del = el("del");
      del.appendChild(renderInline(tok.slice(2, -2), currentDocPath));
      frag.appendChild(del);
    } else if (tok.startsWith("*") && tok.endsWith("*")) {
      const em = el("em");
      em.appendChild(renderInline(tok.slice(1, -1), currentDocPath));
      frag.appendChild(em);
    } else if (tok.startsWith("[")) {
      const sep = tok.indexOf("](");
      const label = tok.slice(1, sep);
      const href = tok.slice(sep + 2, -1);
      const target = resolveDocLink(href, currentDocPath);
      if (!target) {
        frag.appendChild(document.createTextNode(label));
      } else if (target.internalId) {
        const a = el("a");
        a.href = `#/doc/${target.internalId}`;
        a.appendChild(renderInline(label, currentDocPath));
        frag.appendChild(a);
      } else if (target.anchor) {
        const a = el("a");
        a.href = `#${target.anchor}`;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          document.getElementById(target.anchor)?.scrollIntoView({ behavior: "smooth" });
        });
        a.appendChild(renderInline(label, currentDocPath));
        frag.appendChild(a);
      } else {
        const a = el("a");
        a.href = target.externalUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.appendChild(renderInline(label, currentDocPath));
        frag.appendChild(a);
      }
    }
    last = m.index + tok.length;
  }

  if (last < src.length) {
    frag.appendChild(document.createTextNode(src.slice(last)));
  }
  return frag;
}

function splitTableRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let cur = "";
  for (let i = 0; i < trimmed.length; i += 1) {
    if (trimmed[i] === "\\" && trimmed[i + 1] === "|") {
      cur += "|";
      i += 1;
    } else if (trimmed[i] === "|") {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += trimmed[i];
    }
  }
  cells.push(cur.trim());
  return cells;
}

function isTableSeparator(line) {
  return /^\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function renderMarkdown(markdown, currentDocPath) {
  const container = el("div", "prose");
  const headings = [];
  const seenSlugs = new Map();
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim() || "text";
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      const codeText = codeLines.join("\n");
      const wrap = el("div", "code-block-wrap");
      const head = el("div", "code-block-head");
      head.appendChild(el("span", null, lang));
      const copyBtn = el("button", "copy-btn", "Copy");
      copyBtn.type = "button";
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          copyBtn.textContent = "Copied";
          setTimeout(() => { copyBtn.textContent = "Copy"; }, 1400);
        } catch {
          copyBtn.textContent = "Failed";
        }
      });
      head.appendChild(copyBtn);
      const pre = el("pre");
      pre.appendChild(el("code", null, codeText));
      wrap.appendChild(head);
      wrap.appendChild(pre);
      container.appendChild(wrap);
      continue;
    }

    // Horizontal rule
    if (/^(?:---|\*\*\*|___)\s*$/.test(trimmed)) {
      container.appendChild(el("hr"));
      i += 1;
      continue;
    }

    // Heading
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = hMatch[2].trim();
      let baseSlug = slugify(text);
      const count = seenSlugs.get(baseSlug) || 0;
      seenSlugs.set(baseSlug, count + 1);
      const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;
      const h = el(`h${level}`);
      h.id = id;
      h.appendChild(renderInline(text, currentDocPath));
      if (level === 2 || level === 3) {
        const anchor = el("a", "heading-anchor", "#");
        anchor.href = `#${id}`;
        anchor.setAttribute("aria-label", `Link to ${text}`);
        anchor.addEventListener("click", (e) => {
          e.preventDefault();
          h.scrollIntoView({ behavior: "smooth" });
        });
        h.appendChild(anchor);
        headings.push({ id, title: text.replace(/`/g, ""), depth: level });
      }
      container.appendChild(h);
      i += 1;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      const bq = el("blockquote");
      const joined = quoteLines.join(" ");
      if (/\bREJECT\b/.test(joined)) bq.classList.add("reject-callout");
      const p = el("p");
      p.appendChild(renderInline(joined, currentDocPath));
      bq.appendChild(p);
      container.appendChild(bq);
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = splitTableRow(line);
      i += 2;
      const tableWrap = el("div", "table-wrap");
      const table = el("table");
      const thead = el("thead");
      const headRow = el("tr");
      for (const hCell of headers) {
        const th = el("th");
        th.appendChild(renderInline(hCell, currentDocPath));
        headRow.appendChild(th);
      }
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = el("tbody");
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        const cells = splitTableRow(lines[i]);
        const tr = el("tr");
        for (let c = 0; c < headers.length; c += 1) {
          const td = el("td");
          td.appendChild(renderInline(cells[c] || "", currentDocPath));
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
        i += 1;
      }
      table.appendChild(tbody);
      tableWrap.appendChild(table);
      container.appendChild(tableWrap);
      continue;
    }

    // Lists (ordered or unordered)
    if (/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const list = el(ordered ? "ol" : "ul");
      while (i < lines.length && /^\s*(?:[-*+]\s+|\d+\.\s+)/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*(?:[-*+]|\d+\.)\s+/, "");
        const li = el("li");
        const taskMatch = itemText.match(/^\[([ xX])\]\s+([\s\S]+)$/);
        if (taskMatch) {
          li.className = "task-item";
          const box = el("input", "task-box");
          box.type = "checkbox";
          box.checked = taskMatch[1].toLowerCase() === "x";
          box.disabled = true;
          const span = el("span");
          span.appendChild(renderInline(taskMatch[2], currentDocPath));
          li.appendChild(box);
          li.appendChild(span);
        } else {
          li.appendChild(renderInline(itemText, currentDocPath));
        }
        list.appendChild(li);
        i += 1;
      }
      container.appendChild(list);
      continue;
    }

    // Paragraph (collect contiguous lines until blank or block start)
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !/^#{1,4}\s+/.test(lines[i]) &&
      !/^(?:---|\*\*\*|___)\s*$/.test(lines[i].trim()) &&
      !/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    const p = el("p");
    p.appendChild(renderInline(paraLines.join(" "), currentDocPath));
    container.appendChild(p);
  }

  return { container, headings };
}

function buildSidebar() {
  const container = document.getElementById("sidebar-nav");
  clearNode(container);
  state.flatOrder = [];

  for (const section of state.data.nav) {
    const groupDiv = el("div", "nav-group");
    const groupBtn = el("button", "nav-group-btn");
    groupBtn.type = "button";
    groupBtn.setAttribute("aria-expanded", "true");
    groupBtn.appendChild(el("span", null, section.group));
    const chevron = el("span", null, "▾");
    groupBtn.appendChild(chevron);

    const bodyDiv = el("div");
    groupBtn.addEventListener("click", () => {
      const expanded = groupBtn.getAttribute("aria-expanded") === "true";
      groupBtn.setAttribute("aria-expanded", String(!expanded));
      bodyDiv.hidden = expanded;
      chevron.textContent = expanded ? "▸" : "▾";
    });

    if (section.items) {
      const ul = el("ul", "nav-list");
      for (const item of section.items) {
        state.flatOrder.push(item.id);
        const li = el("li");
        const a = el("a", "nav-link", item.title);
        a.href = `#/doc/${item.id}`;
        a.dataset.docId = item.id;
        li.appendChild(a);
        ul.appendChild(li);
      }
      bodyDiv.appendChild(ul);
    }

    if (section.subgroups) {
      for (const sub of section.subgroups) {
        bodyDiv.appendChild(el("div", "nav-subgroup-label", sub.label));
        const ul = el("ul", "nav-list");
        for (const item of sub.items) {
          state.flatOrder.push(item.id);
          const li = el("li");
          const a = el("a", "nav-link", item.title);
          a.href = `#/doc/${item.id}`;
          a.dataset.docId = item.id;
          li.appendChild(a);
          ul.appendChild(li);
        }
        bodyDiv.appendChild(ul);
      }
    }

    groupDiv.appendChild(groupBtn);
    groupDiv.appendChild(bodyDiv);
    container.appendChild(groupDiv);
  }
}

function renderToc(headings) {
  const tocList = document.getElementById("toc-list");
  clearNode(tocList);
  if (state.observer) {
    state.observer.disconnect();
    state.observer = null;
  }

  if (headings.length === 0) {
    tocList.appendChild(el("li", "toc-link", "No subsections"));
    return;
  }

  const linkMap = new Map();
  for (const h of headings) {
    const li = el("li");
    const a = el("a", `toc-link depth-${h.depth}`, h.title);
    a.href = `#${h.id}`;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
    });
    li.appendChild(a);
    tocList.appendChild(li);
    linkMap.set(h.id, a);
  }

  if ("IntersectionObserver" in window) {
    state.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            for (const link of linkMap.values()) link.classList.remove("active");
            linkMap.get(entry.target.id)?.classList.add("active");
          }
        }
      },
      { rootMargin: "-72px 0px -70% 0px", threshold: 0.1 }
    );
    for (const h of headings) {
      const target = document.getElementById(h.id);
      if (target) state.observer.observe(target);
    }
  }
}

function renderOverviewBanner() {
  const c = state.data.counts;
  const banner = el("section", "overview-banner");
  const title = el("strong", null, "Repository-Synced Production Documentation");
  const desc = el("p", null, "Every Markdown file, skill contract, gate specification, template, and golden eval suite in this portal is generated directly from the repository via GitHub Actions.");
  desc.style.margin = "4px 0 0";
  desc.style.color = "var(--muted-fg)";
  desc.style.fontSize = "13.5px";
  banner.appendChild(title);
  banner.appendChild(desc);

  const grid = el("div", "overview-stats");
  const cards = [
    { num: c.knowledge, label: "Knowledge Baselines", id: "knowledge/principles" },
    { num: c.skills, label: "Agent Skills", id: "skills/frontend/component-architecture" },
    { num: c.gates, label: "Quality Gates", id: "gates/pre-commit/lint-and-typecheck" },
    { num: c.templates, label: "Templates", id: "templates/frontend-app/README" },
    { num: c.evals, label: "Eval Suites", id: "evals/golden-sets" }
  ];
  for (const card of cards) {
    const a = el("a", "stat-card");
    a.href = `#/doc/${card.id}`;
    a.appendChild(el("div", "stat-num", String(card.num)));
    a.appendChild(el("div", "stat-label", card.label));
    grid.appendChild(a);
  }
  banner.appendChild(grid);
  return banner;
}

function renderDoc(docId) {
  const doc = state.data.docs[docId] || state.data.docs["overview/readme"];
  if (!doc) return;
  state.currentId = doc.id;
  document.title = `${doc.title} | Web Prod Skills Docs`;

  // Update active sidebar links & top nav
  for (const link of document.querySelectorAll(".nav-link")) {
    const isActive = link.dataset.docId === doc.id;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
      const parentBody = link.closest(".nav-group > div");
      if (parentBody && parentBody.hidden) {
        parentBody.hidden = false;
        const btn = parentBody.previousElementSibling;
        if (btn) btn.setAttribute("aria-expanded", "true");
      }
    } else {
      link.removeAttribute("aria-current");
    }
  }
  for (const btn of document.querySelectorAll(".top-nav-btn")) {
    btn.classList.toggle("active", btn.dataset.group === doc.group);
  }

  const root = document.getElementById("doc-content");
  clearNode(root);

  // Breadcrumb
  const bc = el("nav", "breadcrumb");
  bc.setAttribute("aria-label", "Breadcrumb");
  bc.appendChild(el("span", null, "Docs"));
  bc.appendChild(el("span", "breadcrumb-sep", "/"));
  bc.appendChild(el("span", null, doc.group));
  if (doc.subgroup) {
    bc.appendChild(el("span", "breadcrumb-sep", "/"));
    bc.appendChild(el("span", null, doc.subgroup));
  }
  bc.appendChild(el("span", "breadcrumb-sep", "/"));
  bc.appendChild(el("span", "breadcrumb-current", doc.title));
  root.appendChild(bc);

  // Meta badges
  const metaBar = el("div", "doc-meta-bar");
  if (doc.path) {
    const srcBadge = el("a", "meta-badge mono link", doc.path);
    srcBadge.href = `${state.data.repoUrl}/blob/main/${doc.path}`;
    srcBadge.target = "_blank";
    srcBadge.rel = "noopener noreferrer";
    metaBar.appendChild(srcBadge);
  }
  if (doc.meta?.version) {
    metaBar.appendChild(el("span", "meta-badge mono", `v${doc.meta.version}`));
  }
  if (doc.meta?.stage) {
    metaBar.appendChild(el("span", "meta-badge", `Stage: ${doc.meta.stage}`));
  }
  if (doc.meta?.severity) {
    metaBar.appendChild(el("span", "meta-badge", `Severity: ${doc.meta.severity}`));
  }
  if (doc.meta?.requires_gate) {
    const gateDocId = doc.meta.requires_gate;
    const gateLink = el("a", "meta-badge link", `Gate: ${gateDocId.replace(/^gates\//, "")}`);
    gateLink.href = `#/doc/${gateDocId}`;
    metaBar.appendChild(gateLink);
  }
  if (Array.isArray(doc.meta?.applies_to)) {
    for (const tag of doc.meta.applies_to) {
      metaBar.appendChild(el("span", "meta-badge", tag));
    }
  }
  root.appendChild(metaBar);

  if (doc.id === "overview/readme") {
    root.appendChild(renderOverviewBanner());
  }

  const { container, headings } = renderMarkdown(doc.markdown, doc.path);
  root.appendChild(container);
  renderToc(headings);

  // Pager
  const idx = state.flatOrder.indexOf(doc.id);
  const pager = el("nav", "doc-pager");
  pager.setAttribute("aria-label", "Page navigation");
  if (idx > 0) {
    const prevDoc = state.data.docs[state.flatOrder[idx - 1]];
    if (prevDoc) {
      const a = el("a", "pager-card");
      a.href = `#/doc/${prevDoc.id}`;
      a.appendChild(el("span", "pager-label", "← Previous"));
      a.appendChild(el("span", "pager-title", prevDoc.title));
      pager.appendChild(a);
    }
  } else {
    pager.appendChild(el("div"));
  }
  if (idx !== -1 && idx < state.flatOrder.length - 1) {
    const nextDoc = state.data.docs[state.flatOrder[idx + 1]];
    if (nextDoc) {
      const a = el("a", "pager-card next");
      a.href = `#/doc/${nextDoc.id}`;
      a.appendChild(el("span", "pager-label", "Next →"));
      a.appendChild(el("span", "pager-title", nextDoc.title));
      pager.appendChild(a);
    }
  }
  root.appendChild(pager);

  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function openMobileSidebar() {
  document.getElementById("sidebar")?.classList.add("open");
  const bd = document.getElementById("sidebar-backdrop");
  if (bd) bd.hidden = false;
  document.getElementById("mobile-menu-btn")?.setAttribute("aria-expanded", "true");
}

function closeMobileSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  const bd = document.getElementById("sidebar-backdrop");
  if (bd) bd.hidden = true;
  document.getElementById("mobile-menu-btn")?.setAttribute("aria-expanded", "false");
}

function initTheme() {
  const btn = document.getElementById("theme-toggle");
  const sun = document.getElementById("icon-sun");
  const moon = document.getElementById("icon-moon");

  function syncIcons() {
    const isDark = document.documentElement.classList.contains("dark");
    if (sun) sun.hidden = !isDark;
    if (moon) moon.hidden = isDark;
    btn?.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  btn?.addEventListener("click", () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    try { localStorage.setItem("wps-theme", nextDark ? "dark" : "light"); } catch (err) { console.warn("Theme storage unavailable", err); }
    syncIcons();
  });
  syncIcons();
}

function initSearch() {
  const dialog = document.getElementById("search-dialog");
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  const trigger = document.getElementById("search-trigger");

  state.searchIndex = Object.values(state.data.docs).map((d) => ({
    id: d.id,
    title: d.title,
    group: d.group,
    subgroup: d.subgroup || "",
    path: d.path || "",
    haystack: `${d.title} ${d.group} ${d.subgroup || ""} ${d.path || ""} ${d.description || ""} ${(d.meta?.triggers || []).join(" ")} ${d.markdown.slice(0, 1200)}`.toLowerCase()
  }));

  function renderResults(query) {
    clearNode(results);
    const q = query.trim().toLowerCase();
    const matches = q
      ? state.searchIndex.filter((item) => item.haystack.includes(q)).slice(0, 20)
      : state.searchIndex.slice(0, 12);
    state.selectedSearchIdx = 0;

    if (matches.length === 0) {
      results.appendChild(el("div", "search-item-meta", "No matching documentation found."));
      return;
    }

    matches.forEach((m, i) => {
      const btn = el("button", `search-item${i === 0 ? " selected" : ""}`);
      btn.type = "button";
      btn.dataset.docId = m.id;
      btn.appendChild(el("div", "search-item-title", m.title));
      btn.appendChild(el("div", "search-item-meta", `${m.group} · ${m.path || m.subgroup}`));
      btn.addEventListener("click", () => {
        window.location.hash = `#/doc/${m.id}`;
        closeSearch();
      });
      results.appendChild(btn);
    });
  }

  function openSearch() {
    dialog.hidden = false;
    input.value = "";
    renderResults("");
    input.focus();
  }

  function closeSearch() {
    dialog.hidden = true;
  }

  trigger?.addEventListener("click", openSearch);
  dialog?.addEventListener("click", (e) => {
    if (e.target === dialog) closeSearch();
  });
  input?.addEventListener("input", () => renderResults(input.value));

  input?.addEventListener("keydown", (e) => {
    const items = [...results.querySelectorAll(".search-item")];
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      state.selectedSearchIdx = (state.selectedSearchIdx + 1) % items.length;
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      state.selectedSearchIdx = (state.selectedSearchIdx - 1 + items.length) % items.length;
    } else if (e.key === "Enter" && items[state.selectedSearchIdx]) {
      e.preventDefault();
      items[state.selectedSearchIdx].click();
      return;
    } else if (e.key === "Escape") {
      closeSearch();
      return;
    } else {
      return;
    }
    items.forEach((it, idx) => it.classList.toggle("selected", idx === state.selectedSearchIdx));
    items[state.selectedSearchIdx]?.scrollIntoView({ block: "nearest" });
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (dialog.hidden) openSearch();
      else closeSearch();
    } else if (e.key === "Escape" && !dialog.hidden) {
      closeSearch();
    }
  });
}

function handleRoute() {
  const hash = window.location.hash;
  if (hash.startsWith("#/doc/")) {
    const id = hash.slice(6);
    if (state.data.docs[id]) {
      renderDoc(id);
      return;
    }
  }
  renderDoc("overview/readme");
}

async function boot() {
  initTheme();
  document.getElementById("mobile-menu-btn")?.addEventListener("click", openMobileSidebar);
  document.getElementById("sidebar-close-btn")?.addEventListener("click", closeMobileSidebar);
  document.getElementById("sidebar-backdrop")?.addEventListener("click", closeMobileSidebar);

  for (const btn of document.querySelectorAll(".top-nav-btn")) {
    btn.addEventListener("click", () => {
      const target = btn.dataset.defaultDoc;
      if (target) window.location.hash = `#/doc/${target}`;
    });
  }

  // WEB-PROD-OBSERVABILITY-EXEMPT: static GitHub Pages browser viewer fetching local docs-data.json
  try {
    const res = await fetch("./docs-data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.data = await res.json();
    const verEl = document.getElementById("version-pill");
    if (verEl) verEl.textContent = `v${state.data.version}`;
    const revEl = document.getElementById("footer-rev");
    if (revEl) revEl.textContent = `v${state.data.version} · rev ${state.data.revision} · ${state.data.counts.docs} docs`;

    const fallback = document.getElementById("seo-fallback");
    if (fallback) fallback.hidden = true;

    buildSidebar();
    initSearch();
    handleRoute();
    window.addEventListener("hashchange", handleRoute);
  } catch (err) {
    const root = document.getElementById("doc-content");
    if (root) {
      clearNode(root);
      root.appendChild(el("h1", null, "Documentation Viewer"));
      root.appendChild(el("p", null, `Unable to load repository index (docs-data.json): ${err.message}. Run 'npm run build:site' or serve over HTTP.`));
    }
  }
}

boot();
