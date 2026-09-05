(() => {
  "use strict";

  /*
   * DevOps Academy — Robot Framework highlighter (v2)
   *
   * Robot Framework syntax is table-oriented and is not included in the
   * Highlight.js core bundle used by the academy. This script highlights
   * Robot source directly while emitting standard hljs-* token classes.
   * A small theme-aware fallback stylesheet makes the tokens visibly distinct
   * even when the CDN theme does not assign a color to every class we use.
   */

  const SELECTOR =
    "pre code.language-robotframework, pre code.language-robot";

  const sections = new Set([
    "settings",
    "variables",
    "test cases",
    "tasks",
    "keywords",
    "comments",
  ]);

  const controls = new Set([
    "IF",
    "ELSE IF",
    "ELSE",
    "END",
    "FOR",
    "WHILE",
    "TRY",
    "EXCEPT",
    "FINALLY",
    "BREAK",
    "CONTINUE",
    "RETURN",
    "VAR",
    "GROUP",
  ]);

  const settings = new Set([
    "Documentation",
    "Metadata",
    "Library",
    "Resource",
    "Variables",
    "Suite Setup",
    "Suite Teardown",
    "Test Setup",
    "Test Teardown",
    "Task Setup",
    "Task Teardown",
    "Test Template",
    "Task Template",
    "Test Timeout",
    "Task Timeout",
    "Force Tags",
    "Default Tags",
    "Test Tags",
    "Task Tags",
  ]);

  const localSettings = /^\[(Documentation|Arguments|Tags|Setup|Teardown|Template|Timeout|Return|Return Statement)\]$/i;
  const variableOnly = /^[@$&%]\{[^}\n]+\}=?$/;
  const expressionVariable = /^\$[A-Za-z_][A-Za-z0-9_]*$/;

  const escapeHtml = (value) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const span = (className, value) =>
    `<span class="${className}">${value}</span>`;

  function ensureFallbackTheme() {
    if (document.getElementById("robot-framework-highlight-theme")) return;

    const style = document.createElement("style");
    style.id = "robot-framework-highlight-theme";
    style.textContent = `
      code.rf-robot-highlight.hljs .hljs-section,
      code.rf-robot-highlight.hljs .hljs-keyword {
        color: var(--accent) !important;
        font-weight: 700;
      }
      code.rf-robot-highlight.hljs .hljs-title,
      code.rf-robot-highlight.hljs .hljs-built_in {
        color: var(--accent-2) !important;
        font-weight: 650;
      }
      code.rf-robot-highlight.hljs .hljs-variable,
      code.rf-robot-highlight.hljs .hljs-symbol {
        color: var(--warning) !important;
      }
      code.rf-robot-highlight.hljs .hljs-attr,
      code.rf-robot-highlight.hljs .hljs-meta {
        color: var(--accent-2) !important;
      }
      code.rf-robot-highlight.hljs .hljs-string {
        color: var(--accent) !important;
      }
      code.rf-robot-highlight.hljs .hljs-number,
      code.rf-robot-highlight.hljs .hljs-literal {
        color: var(--warning) !important;
      }
      code.rf-robot-highlight.hljs .hljs-comment {
        color: var(--muted-2, var(--muted)) !important;
        font-style: italic;
      }
    `;
    document.head.appendChild(style);
  }

  function tokenize(value) {
    let out = "";
    let i = 0;

    while (i < value.length) {
      const rest = value.slice(i);

      const robotVar = rest.match(/^[@$&%]\{[^}\n]+\}/);
      if (robotVar) {
        out += span("hljs-variable", escapeHtml(robotVar[0]));
        i += robotVar[0].length;
        continue;
      }

      const exprVar = rest.match(/^\$[A-Za-z_][A-Za-z0-9_]*/);
      if (exprVar) {
        out += span("hljs-variable", escapeHtml(exprVar[0]));
        i += exprVar[0].length;
        continue;
      }

      const quoted = rest.match(/^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);
      if (quoted) {
        out += span("hljs-string", escapeHtml(quoted[0]));
        i += quoted[0].length;
        continue;
      }

      const url = rest.match(/^https?:\/\/[^\s]+/i);
      if (url) {
        out += span("hljs-string", escapeHtml(url[0]));
        i += url[0].length;
        continue;
      }

      const named = rest.match(/^([A-Za-z_][A-Za-z0-9_.-]*)(=)/);
      if (named) {
        out += span("hljs-attr", escapeHtml(named[1]));
        out += escapeHtml(named[2]);
        i += named[0].length;
        continue;
      }

      const option = rest.match(/^--[A-Za-z0-9][A-Za-z0-9_.-]*/);
      if (option) {
        out += span("hljs-attr", escapeHtml(option[0]));
        i += option[0].length;
        continue;
      }

      const literal = rest.match(/^(?:True|False|None|null)\b/i);
      if (literal) {
        out += span("hljs-literal", escapeHtml(literal[0]));
        i += literal[0].length;
        continue;
      }

      const number = rest.match(/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)\b/);
      if (number) {
        out += span("hljs-number", escapeHtml(number[0]));
        i += number[0].length;
        continue;
      }

      out += escapeHtml(value[i]);
      i += 1;
    }

    return out;
  }

  function classifyCells(line, section, cells) {
    const roles = cells.map(() => "value");
    if (!cells.length) return roles;

    const first = cells[0].trim();
    const pipeBodyRow = /^\s*\|\s*\|/.test(line);
    const definitionLine =
      (section === "test cases" || section === "tasks" || section === "keywords") &&
      !/^\s/.test(line) &&
      !pipeBodyRow;

    if (definitionLine) {
      roles[0] = "title";
      return roles;
    }

    if (section === "settings" && settings.has(first)) {
      roles[0] = "setting";
      return roles;
    }

    if (section === "variables" && variableOnly.test(first)) {
      roles[0] = "variable";
      return roles;
    }

    if (localSettings.test(first)) {
      roles[0] = "local-setting";
      return roles;
    }

    if (first === "...") {
      roles[0] = "continuation";
      if (cells.length > 1) roles[1] = "keyword";
      return roles;
    }

    if (controls.has(first.toUpperCase())) {
      roles[0] = "control";
      return roles;
    }

    // Executable row. One or more assignment cells can precede the keyword.
    let keywordIndex = 0;
    while (
      keywordIndex < cells.length &&
      (variableOnly.test(cells[keywordIndex].trim()) ||
        expressionVariable.test(cells[keywordIndex].trim()))
    ) {
      roles[keywordIndex] = "variable";
      keywordIndex += 1;
    }

    if (keywordIndex < cells.length) {
      roles[keywordIndex] = "keyword";
    }

    return roles;
  }

  function renderCell(raw, role) {
    const content = tokenize(raw);

    switch (role) {
      case "title":
        return span("hljs-title", content);
      case "setting":
      case "control":
        return span("hljs-keyword", content);
      case "local-setting":
        return span("hljs-attr", content);
      case "variable":
        return span("hljs-variable", escapeHtml(raw));
      case "continuation":
        return span("hljs-meta", content);
      case "keyword":
        return span("hljs-title function_", content);
      default:
        return content;
    }
  }

  function highlightLine(line, state) {
    const trimmed = line.trim();
    if (!trimmed) return "";

    if (/^\s*#/.test(line)) {
      return span("hljs-comment", escapeHtml(line));
    }

    // Accept both valid section headers and deliberately malformed examples so
    // broken Robot source is still visibly Robot source in diagnostics lessons.
    const sectionMatch = trimmed.match(/^\*{2,}\s*([^*]+?)\s*\*{2,}$/);
    if (sectionMatch) {
      const candidate = sectionMatch[1].trim().toLowerCase();
      if (sections.has(candidate)) state.section = candidate;
      return span("hljs-section", escapeHtml(line));
    }

    // Preserve all original separators. Robot cells use tabs, 2+ spaces, or
    // pipe-table delimiters.
    const parts = line.split(/(\t+| {2,}|\s*\|\s*)/);
    const cellParts = parts.filter(
      (part) => part && !/^(?:\t+| {2,}|\s*\|\s*)$/.test(part),
    );
    const roles = classifyCells(line, state.section, cellParts);

    let cellIndex = 0;
    return parts
      .map((part) => {
        if (!part) return "";
        if (/^(?:\t+| {2,}|\s*\|\s*)$/.test(part)) {
          return escapeHtml(part);
        }
        const rendered = renderCell(part, roles[cellIndex] || "value");
        cellIndex += 1;
        return rendered;
      })
      .join("");
  }

  function highlightRobotBlock(code) {
    // Always start from textContent so this is idempotent even if another
    // highlighter touched the block before us.
    const source = code.textContent;
    const state = { section: "" };
    const highlighted = source
      .split("\n")
      .map((line) => highlightLine(line, state))
      .join("\n");

    code.innerHTML = highlighted;
    code.dataset.highlighted = "yes";
    code.dataset.robotHighlighted = "v2";
    code.classList.add("hljs", "rf-robot-highlight");
  }

  function run() {
    ensureFallbackTheme();
    document.querySelectorAll(SELECTOR).forEach(highlightRobotBlock);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
