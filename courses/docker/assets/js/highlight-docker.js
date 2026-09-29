(() => {
  "use strict";

  /* DevOps Academy — Docker CLI highlighter.
   * Handles docker/docker-compose command blocks that are primarily Docker CLI
   * while preserving shell variables, strings, comments, options, and output.
   * It intentionally marks processed blocks so course.js/Highlight.js does not
   * try to reinterpret them as another language.
   */

  const escapeHtml = (value) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const dockerCommands = new Set([
    "attach", "build", "builder", "buildx", "checkpoint", "commit", "compose",
    "config", "container", "context", "cp", "create", "diff", "events", "exec",
    "export", "history", "image", "images", "import", "info", "inspect", "kill",
    "load", "login", "logout", "logs", "manifest", "network", "node", "pause",
    "plugin", "port", "ps", "pull", "push", "rename", "restart", "rm", "rmi",
    "run", "save", "search", "secret", "service", "stack", "start", "stats",
    "stop", "swarm", "system", "tag", "top", "trust", "unpause", "update",
    "version", "volume", "wait"
  ]);

  const composeCommands = new Set([
    "alpha", "attach", "bridge", "build", "config", "cp", "create", "down",
    "events", "exec", "images", "kill", "logs", "ls", "pause", "port", "ps",
    "publish", "pull", "push", "restart", "rm", "run", "start", "stats", "stop",
    "top", "unpause", "up", "version", "wait", "watch"
  ]);

  const span = (className, value) =>
    `<span class="${className}">${escapeHtml(value)}</span>`;

  function highlightLine(line) {
    let html = "";
    let i = 0;
    let sawDocker = false;
    let sawCompose = false;

    while (i < line.length) {
      const ch = line[i];

      if (/\s/.test(ch)) {
        html += ch;
        i += 1;
        continue;
      }

      if (ch === "#") {
        html += span("hljs-comment", line.slice(i));
        break;
      }

      if (ch === '"' || ch === "'") {
        const quote = ch;
        let end = i + 1;
        let escaped = false;
        while (end < line.length) {
          const c = line[end];
          if (quote === '"' && !escaped && c === "\\") {
            escaped = true;
            end += 1;
            continue;
          }
          if (!escaped && c === quote) {
            end += 1;
            break;
          }
          escaped = false;
          end += 1;
        }
        html += span("hljs-string", line.slice(i, end));
        i = end;
        continue;
      }

      if (ch === "$" && line[i + 1] === "(") {
        html += escapeHtml(ch);
        i += 1;
        continue;
      }

      if (/[(){};|&]/.test(ch)) {
        html += escapeHtml(ch);
        i += 1;
        continue;
      }

      if (ch === "$") {
        const variable = line.slice(i).match(/^\$(?:\{[A-Za-z_][A-Za-z0-9_]*\}|[A-Za-z_][A-Za-z0-9_]*)/);
        if (variable) {
          html += span("hljs-variable", variable[0]);
          i += variable[0].length;
          continue;
        }
      }

      if (ch === "-" && line[i + 1] === "-") {
        const option = line.slice(i).match(/^--[A-Za-z0-9][A-Za-z0-9._:=/-]*/);
        if (option) {
          html += span("hljs-attr", option[0]);
          i += option[0].length;
          continue;
        }
      }

      if (ch === "-") {
        const option = line.slice(i).match(/^-[A-Za-z0-9]+/);
        if (option) {
          html += span("hljs-attr", option[0]);
          i += option[0].length;
          continue;
        }
      }

      const tokenMatch = line.slice(i).match(/^[^\s"'#]+/);
      if (!tokenMatch) {
        html += escapeHtml(ch);
        i += 1;
        continue;
      }

      const token = tokenMatch[0];
      const plain = token.replace(/[;|&()]+$/g, "");
      const suffix = token.slice(plain.length);

      if (plain === "docker" || plain === "docker.exe" || plain === "docker-compose") {
        html += span("hljs-built_in", plain);
        sawDocker = true;
        sawCompose = plain === "docker-compose";
      } else if (sawDocker && dockerCommands.has(plain)) {
        html += span("hljs-keyword", plain);
        sawCompose = plain === "compose";
      } else if (sawCompose && composeCommands.has(plain)) {
        html += span("hljs-title", plain);
      } else if (/^[A-Z_][A-Z0-9_]*=/.test(plain)) {
        const eq = plain.indexOf("=");
        html += span("hljs-variable", plain.slice(0, eq)) + "=" + escapeHtml(plain.slice(eq + 1));
      } else if (/^(?:true|false|null)$/i.test(plain)) {
        html += span("hljs-literal", plain);
      } else if (/^\d+(?:\.\d+)*$/.test(plain)) {
        html += span("hljs-number", plain);
      } else {
        html += escapeHtml(plain);
      }

      html += escapeHtml(suffix);
      i += token.length;
    }

    return html;
  }

  function highlightDockerBlock(code) {
    const source = code.textContent;
    code.innerHTML = source.split("\n").map(highlightLine).join("\n");
    code.dataset.highlighted = "yes";
    code.classList.add("hljs");
    code.parentElement?.classList.add("docker-code-block");
  }

  document
    .querySelectorAll("pre code.language-dockercli")
    .forEach(highlightDockerBlock);
})();
