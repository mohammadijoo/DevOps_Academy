(() => {
  const normalizePath = (value) => {
    try {
      const url = new URL(value, window.location.href);
      return decodeURIComponent(url.pathname).replace(/\/{2,}/g, "/").replace(/\/$/, "");
    } catch (_) {
      return String(value || "").replace(/\/{2,}/g, "/").replace(/\/$/, "");
    }
  };

  // Ensure exactly one static/runtime current lesson marker before course.js runs.
  const currentPath = normalizePath(window.location.pathname);
  const sidebarItems = [...document.querySelectorAll(".sidebar-lesson")];
  const runtimeCurrent = sidebarItems.find((item) => normalizePath(item.href) === currentPath);
  if (runtimeCurrent) {
    sidebarItems.forEach((item) => item.classList.toggle("is-current", item === runtimeCurrent));
    runtimeCurrent.setAttribute("aria-current", "page");
  }

  // Make every table use the canonical responsive wrapper without changing table content.
  document.querySelectorAll(".lesson-article table").forEach((table) => {
    if (table.parentElement?.classList.contains("table-wrap")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrap";
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  // Register lightweight fallbacks only when the CDN common build lacks a language.
  if (window.hljs) {
    const register = (name, factory, aliases = []) => {
      if (hljs.getLanguage(name)) return;
      hljs.registerLanguage(name, factory);
      aliases.forEach((alias) => {
        try { hljs.registerAliases(alias, { languageName: name }); } catch (_) {}
      });
    };

    register("hcl", (h) => ({
      name: "HCL",
      aliases: ["terraform", "tf"],
      keywords: "resource data variable output module provider terraform locals backend required_providers required_version for_each count depends_on lifecycle dynamic true false null",
      contains: [h.HASH_COMMENT_MODE, h.C_LINE_COMMENT_MODE, h.QUOTE_STRING_MODE, h.NUMBER_MODE]
    }), ["terraform", "tf"]);

    register("toml", (h) => ({
      name: "TOML",
      contains: [
        { className: "section", begin: /^\s*\[{1,2}/, end: /\]{1,2}\s*$/ },
        h.HASH_COMMENT_MODE,
        h.QUOTE_STRING_MODE,
        h.NUMBER_MODE,
        { className: "literal", begin: /\b(true|false)\b/ }
      ]
    }));

    register("mermaid", (h) => ({
      name: "Mermaid",
      keywords: "flowchart graph subgraph end direction classDef class style linkStyle click sequenceDiagram stateDiagram-v2 stateDiagram gitGraph gantt pie mindmap timeline",
      contains: [
        { className: "comment", begin: /%%/, end: /$/ },
        h.QUOTE_STRING_MODE,
        h.NUMBER_MODE,
        { className: "symbol", begin: /-->|-.->|==>|---|\|[^|]+\|/ }
      ]
    }));

    register("dockerfile", (h) => ({
      name: "Dockerfile",
      case_insensitive: true,
      keywords: "FROM RUN CMD LABEL EXPOSE ENV ADD COPY ENTRYPOINT VOLUME USER WORKDIR ARG ONBUILD STOPSIGNAL HEALTHCHECK SHELL MAINTAINER",
      contains: [h.HASH_COMMENT_MODE, h.QUOTE_STRING_MODE, h.NUMBER_MODE]
    }));

    register("markdown", (h) => ({
      name: "Markdown",
      aliases: ["md"],
      contains: [
        { className: "section", begin: /^#{1,6}\s+/, end: /$/ },
        { className: "bullet", begin: /^\s*[-*+]\s+/ },
        { className: "code", begin: /`+/, end: /`+/ },
        h.QUOTE_STRING_MODE
      ]
    }), ["md"]);
  }

  // course.js builds the right TOC after this deferred script. Normalize only TOC labels,
  // preserving the visible section headings and lesson content.
  const cleanTocLabels = () => {
    document.querySelectorAll("[data-on-page-toc] a").forEach((link) => {
      link.textContent = link.textContent.replace(
        /^\s*(?:(?:\d+(?:\.\d+)*)[.):-]?|(?:step|phase)\s+\d+[.):-]?)\s*/i,
        ""
      );
    });
  };
  setTimeout(cleanTocLabels, 0);
  window.addEventListener("load", cleanTocLabels, { once: true });
})();
