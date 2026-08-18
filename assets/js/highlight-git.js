(() => {
  "use strict";

  /*
   * DevOps Academy — Git CLI highlighter
   *
   * This intentionally does NOT register a Highlight.js language.
   * Instead, it highlights code.language-gitcli blocks directly
   * using the same hljs-* CSS classes already styled by the
   * active Highlight.js theme.
   */

  const escapeHtml = (value) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const gitCommands = new Set([
    "add",
    "am",
    "apply",
    "archive",
    "bisect",
    "blame",
    "branch",
    "bundle",
    "cat-file",
    "checkout",
    "cherry-pick",
    "clean",
    "clone",
    "commit",
    "commit-graph",
    "config",
    "describe",
    "diff",
    "difftool",
    "fetch",
    "for-each-ref",
    "format-patch",
    "fsck",
    "gc",
    "grep",
    "hash-object",
    "init",
    "log",
    "ls-files",
    "ls-remote",
    "ls-tree",
    "maintenance",
    "merge",
    "merge-base",
    "merge-file",
    "merge-tree",
    "mergetool",
    "multi-pack-index",
    "notes",
    "pack-refs",
    "pull",
    "push",
    "range-diff",
    "rebase",
    "reflog",
    "remote",
    "repack",
    "replace",
    "reset",
    "restore",
    "rev-list",
    "rev-parse",
    "revert",
    "show",
    "show-branch",
    "show-ref",
    "sparse-checkout",
    "stash",
    "status",
    "submodule",
    "switch",
    "symbolic-ref",
    "tag",
    "update-index",
    "update-ref",
    "verify-commit",
    "verify-pack",
    "verify-tag",
    "worktree",
    "write-tree",
  ]);

  const specialRefs = new Set([
    "HEAD",
    "FETCH_HEAD",
    "ORIG_HEAD",
    "MERGE_HEAD",
    "CHERRY_PICK_HEAD",
    "REBASE_HEAD",
  ]);

  function span(className, text) {
    return `<span class="${className}">${escapeHtml(text)}</span>`;
  }

  function tokenizeLine(line) {
    let html = "";
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      // Whitespace
      if (/\s/.test(char)) {
        html += char;
        i++;
        continue;
      }

      // Shell comment
      if (char === "#") {
        html += span("hljs-comment", line.slice(i));
        break;
      }

      // Double-quoted string
      if (char === '"') {
        let end = i + 1;
        let escaped = false;

        while (end < line.length) {
          if (!escaped && line[end] === '"') {
            end++;
            break;
          }

          if (!escaped && line[end] === "\\") {
            escaped = true;
          } else {
            escaped = false;
          }

          end++;
        }

        html += span("hljs-string", line.slice(i, end));
        i = end;
        continue;
      }

      // Single-quoted string
      if (char === "'") {
        let end = line.indexOf("'", i + 1);

        if (end === -1) {
          end = line.length - 1;
        }

        end++;

        html += span("hljs-string", line.slice(i, end));
        i = end;
        continue;
      }

      // Long Git/shell option: --force-with-lease
      if (char === "-" && line[i + 1] === "-") {
        const match = line.slice(i).match(/^--[A-Za-z0-9][A-Za-z0-9._=-]*/);

        if (match) {
          html += span("hljs-attr", match[0]);
          i += match[0].length;
          continue;
        }
      }

      // Short option: -m, -C, -vv
      if (char === "-") {
        const match = line.slice(i).match(/^-[A-Za-z0-9]+/);

        if (match) {
          html += span("hljs-attr", match[0]);
          i += match[0].length;
          continue;
        }
      }

      // Shell variable
      if (char === "$") {
        const match = line
          .slice(i)
          .match(/^\$(?:\{[A-Za-z_][A-Za-z0-9_]*\}|[A-Za-z_][A-Za-z0-9_]*)/);

        if (match) {
          html += span("hljs-variable", match[0]);
          i += match[0].length;
          continue;
        }
      }

      // Normal token
      const tokenMatch = line.slice(i).match(/^[^\s"'#]+/);

      if (!tokenMatch) {
        html += escapeHtml(char);
        i++;
        continue;
      }

      const token = tokenMatch[0];

      if (token === "git") {
        html += span("hljs-built_in", token);
      } else if (gitCommands.has(token)) {
        html += span("hljs-keyword", token);
      } else if (
        specialRefs.has(token) ||
        /^HEAD(?:[~^]\d*)+$/.test(token) ||
        /^refs\/(?:heads|tags|remotes|notes)\//.test(token)
      ) {
        html += span("hljs-symbol", token);
      } else if (/^[0-9a-f]{7,64}$/i.test(token)) {
        html += span("hljs-number", token);
      } else {
        html += escapeHtml(token);
      }

      i += token.length;
    }

    return html;
  }

  function highlightGitBlock(code) {
    const source = code.textContent;

    const highlighted = source.split("\n").map(tokenizeLine).join("\n");

    code.innerHTML = highlighted;

    /*
     * Tell Highlight.js that this block has already been processed,
     * so course.js will not try to highlight it again as another language.
     */
    code.dataset.highlighted = "yes";

    code.classList.add("hljs");
  }

  document
    .querySelectorAll("pre code.language-gitcli")
    .forEach(highlightGitBlock);
})();
