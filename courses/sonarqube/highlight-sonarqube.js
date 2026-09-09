/* SonarQube course additions for highlight.js 11.x.
   Keeps course-specific code classes highlighted without changing lesson content. */
(function () {
  "use strict";
  if (!window.hljs) return;

  // Java .properties is close enough to INI for readable course highlighting.
  if (!hljs.getLanguage("properties") && hljs.getLanguage("ini")) {
    hljs.registerAliases(["properties", "props"], { languageName: "ini" });
  }

  // Groovy is used for a Gradle example. Fall back to the bundled Java grammar
  // when a dedicated Groovy grammar is not present.
  if (!hljs.getLanguage("groovy") && hljs.getLanguage("java")) {
    hljs.registerAliases(["groovy", "gradle-groovy"], { languageName: "java" });
  }

  // highlight.js does not ship a CSV grammar in the common browser bundle.
  if (!hljs.getLanguage("csv")) {
    hljs.registerLanguage("csv", function (hljs) {
      return {
        name: "CSV",
        contains: [
          { className: "string", begin: /"/, end: /"/, contains: [{ begin: /""/ }] },
          { className: "number", begin: /(?:^|,|;)\s*-?(?:\d+(?:\.\d+)?|\.\d+)(?=\s*(?:,|;|$))/ },
          { className: "literal", begin: /(?:^|,|;)\s*(?:true|false|null|yes|no)(?=\s*(?:,|;|$))/i }
        ]
      };
    });
  }
})();
