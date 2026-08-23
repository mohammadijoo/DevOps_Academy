(() => {
  const curriculumSearch = document.querySelector("[data-curriculum-search]");
  const chapters = [...document.querySelectorAll(".chapter-card")];
  const curriculumEmpty = document.querySelector("[data-curriculum-empty]");

  curriculumSearch?.addEventListener("input", () => {
    const q = curriculumSearch.value.trim().toLowerCase();
    let visible = 0;

    chapters.forEach((chapter) => {
      const match = !q || chapter.textContent.toLowerCase().includes(q);
      chapter.hidden = !match;

      if (match) {
        visible += 1;
        if (q) chapter.open = true;
      }
    });

    if (curriculumEmpty) {
      curriculumEmpty.hidden = visible !== 0;
    }
  });

  const expand = document.querySelector("[data-expand-chapters]");
  let expanded = false;

  expand?.addEventListener("click", () => {
    expanded = !expanded;

    chapters.forEach((chapter) => {
      chapter.open = expanded;
    });

    expand.textContent = expanded ? "Collapse all" : "Expand all";
  });

  const sidebar = document.querySelector("[data-course-sidebar]");
  const shell = document.querySelector(".lesson-shell");
  const sidebarCurriculum = document.querySelector(".sidebar-curriculum");

  const currentSidebarLesson = document.querySelector(
    ".sidebar-lesson.is-current",
  );

  const currentSidebarChapter =
    currentSidebarLesson?.closest(".sidebar-chapter");

  let sidebarAlignFrame = null;
  let sidebarCorrectionFrame = null;

  const alignCurrentSidebarChapter = ({ smooth = false } = {}) => {
    if (
      !sidebarCurriculum ||
      !currentSidebarChapter ||
      !currentSidebarLesson
    ) {
      return;
    }

    currentSidebarChapter.open = true;
    currentSidebarLesson.setAttribute("aria-current", "page");

    /*
     * Opening <details>, changing sidebar width, or loading fonts can
     * change the wrapped height of long lesson titles.
     *
     * Wait for two browser layout frames before measuring.
     */
    if (sidebarAlignFrame !== null) {
      cancelAnimationFrame(sidebarAlignFrame);
    }

    if (sidebarCorrectionFrame !== null) {
      cancelAnimationFrame(sidebarCorrectionFrame);
    }

    sidebarAlignFrame = requestAnimationFrame(() => {
      sidebarAlignFrame = requestAnimationFrame(() => {
        const curriculumRect = sidebarCurriculum.getBoundingClientRect();
        const chapterRect = currentSidebarChapter.getBoundingClientRect();
        const lessonRect = currentSidebarLesson.getBoundingClientRect();

        /*
         * Calculate the real visible region of the scrolling curriculum.
         */
        const visibleTop =
          curriculumRect.top + sidebarCurriculum.clientTop;

        const visibleBottom =
          visibleTop + sidebarCurriculum.clientHeight;

        /*
         * Small spacing keeps the highlight/outline away from the
         * exact viewport edge.
         */
        const edgeGap = 8;

        const usableTop = visibleTop + edgeGap;
        const usableBottom = visibleBottom - edgeGap;
        const usableHeight = Math.max(
          1,
          usableBottom - usableTop,
        );

        const currentScroll = sidebarCurriculum.scrollTop;

        /*
         * ORIGINAL / NORMAL BEHAVIOR
         *
         * Put the beginning of the active chapter at the top of
         * the curriculum viewport.
         */
        const chapterTopTarget =
          currentScroll +
          chapterRect.top -
          usableTop;

        /*
         * FALLBACK FOR LONG CHAPTERS
         *
         * This target aligns the bottom of the active lesson with
         * the bottom of the curriculum viewport.
         */
        const lessonBottomTarget =
          currentScroll +
          lessonRect.bottom -
          usableBottom;

        /*
         * Extremely long single lesson title:
         * align its top instead of trying to expose an unreachable bottom.
         */
        const lessonTopTarget =
          currentScroll +
          lessonRect.top -
          usableTop;

        /*
         * Position of the active lesson's bottom relative to the
         * beginning of its chapter.
         *
         * This tells us whether the active lesson would still be visible
         * after placing the chapter at the top.
         */
        const lessonBottomOffsetInChapter =
          lessonRect.bottom -
          chapterRect.top;

        let target;

        if (lessonRect.height > usableHeight) {
          /*
           * A single lesson row is taller than the visible sidebar.
           * Show its beginning.
           */
          target = lessonTopTarget;
        } else if (lessonBottomOffsetInChapter > usableHeight) {
          /*
           * Long chapter:
           *
           * Putting the chapter at the top would hide the active lesson
           * below the sidebar.
           *
           * Instead, put the active lesson at the bottom.
           *
           * This is the behavior needed for long Lesson 4 / Lesson 5
           * entries.
           */
          target = lessonBottomTarget;
        } else {
          /*
           * Normal chapter:
           *
           * Keep the existing behavior and put the chapter at the top.
           */
          target = chapterTopTarget;
        }

        /*
         * Never request an impossible scroll position.
         */
        const maxScroll = Math.max(
          0,
          sidebarCurriculum.scrollHeight -
            sidebarCurriculum.clientHeight,
        );

        target = Math.max(
          0,
          Math.min(target, maxScroll),
        );

        sidebarCurriculum.scrollTo({
          top: target,
          behavior: smooth ? "smooth" : "auto",
        });

        /*
         * IMPORTANT:
         *
         * Measure again after scrolling.
         *
         * Browser scroll clamping, wrapped text, responsive width,
         * or late font/layout changes can leave the lesson a few pixels
         * outside the visible area even when the first calculation was
         * theoretically correct.
         */
        sidebarCorrectionFrame = requestAnimationFrame(() => {
          const finalCurriculumRect =
            sidebarCurriculum.getBoundingClientRect();

          const finalLessonRect =
            currentSidebarLesson.getBoundingClientRect();

          const finalVisibleTop =
            finalCurriculumRect.top +
            sidebarCurriculum.clientTop +
            edgeGap;

          const finalVisibleBottom =
            finalCurriculumRect.top +
            sidebarCurriculum.clientTop +
            sidebarCurriculum.clientHeight -
            edgeGap;

          let correction = 0;

          /*
           * Active lesson is clipped below the sidebar.
           *
           * Move the curriculum downward until the active lesson's
           * bottom sits exactly at the visible bottom.
           */
          if (finalLessonRect.bottom > finalVisibleBottom) {
            correction =
              finalLessonRect.bottom -
              finalVisibleBottom;
          }

          /*
           * Active lesson somehow became clipped above the sidebar.
           */
          else if (finalLessonRect.top < finalVisibleTop) {
            correction =
              finalLessonRect.top -
              finalVisibleTop;
          }

          if (Math.abs(correction) > 0.5) {
            const finalMaxScroll = Math.max(
              0,
              sidebarCurriculum.scrollHeight -
                sidebarCurriculum.clientHeight,
            );

            const correctedTarget = Math.max(
              0,
              Math.min(
                sidebarCurriculum.scrollTop +
                  correction,
                finalMaxScroll,
              ),
            );

            /*
             * Correct instantly.
             *
             * A second smooth animation can compete with the first
             * animation and leave the sidebar between two positions.
             */
            sidebarCurriculum.scrollTo({
              top: correctedTarget,
              behavior: "auto",
            });
          }
        });
      });
    });
  };

  const openSidebar = () => {
    sidebar?.classList.add("is-open");
    shell?.classList.add("sidebar-open");

    alignCurrentSidebarChapter();
  };

  const closeSidebar = () => {
    sidebar?.classList.remove("is-open");
    shell?.classList.remove("sidebar-open");
  };

  document
    .querySelector("[data-sidebar-open]")
    ?.addEventListener("click", openSidebar);

  document
    .querySelector("[data-sidebar-close]")
    ?.addEventListener("click", closeSidebar);

  shell?.addEventListener("click", (event) => {
    if (
      shell.classList.contains("sidebar-open") &&
      event.target === shell
    ) {
      closeSidebar();
    }
  });

  const sidebarSearch = document.querySelector(
    "[data-sidebar-search]",
  );

  const sidebarChapters = [
    ...document.querySelectorAll(".sidebar-chapter"),
  ];

  sidebarSearch?.addEventListener("input", () => {
    const q = sidebarSearch.value.trim().toLowerCase();

    sidebarChapters.forEach((chapter) => {
      const items = [
        ...chapter.querySelectorAll(".sidebar-lesson"),
      ];

      let matches = 0;

      items.forEach((item) => {
        const show =
          !q ||
          item.textContent.toLowerCase().includes(q);

        item.hidden = !show;

        if (show) {
          matches += 1;
        }
      });

      chapter.hidden = Boolean(
        q && matches === 0,
      );

      if (q && matches) {
        chapter.open = true;
      }
    });

    if (!q) {
      alignCurrentSidebarChapter();
    }
  });

  /*
   * Initial alignment.
   */
  alignCurrentSidebarChapter();

  /*
   * Recalculate after all page resources have loaded.
   */
  window.addEventListener("load", () => {
    alignCurrentSidebarChapter();
  });

  /*
   * Recalculate when viewport dimensions change.
   */
  window.addEventListener("resize", () => {
    alignCurrentSidebarChapter();
  });

  /*
   * Long lesson titles can change height after fonts finish loading.
   */
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      alignCurrentSidebarChapter();
    });
  }

  /*
   * Also watch the actual sidebar dimensions.
   *
   * This handles responsive width changes, mobile sidebar opening,
   * and changes in wrapped lesson-title heights.
   */
  if (
    typeof ResizeObserver !== "undefined" &&
    sidebarCurriculum &&
    currentSidebarChapter
  ) {
    const sidebarLayoutObserver =
      new ResizeObserver(() => {
        alignCurrentSidebarChapter();
      });

    sidebarLayoutObserver.observe(
      sidebarCurriculum,
    );

    sidebarLayoutObserver.observe(
      currentSidebarChapter,
    );
  }

  const article =
    document.querySelector(".lesson-article");

  const progress =
    document.querySelector(
      "[data-reading-progress]",
    );

  const progressLabel =
    document.querySelector(
      "[data-progress-label]",
    );

  const updateProgress = () => {
    if (!article || !progress) return;

    const rect =
      article.getBoundingClientRect();

    const available = Math.max(
      1,
      article.offsetHeight - innerHeight,
    );

    const value = Math.max(
      0,
      Math.min(
        1,
        -rect.top / available,
      ),
    );

    progress.style.width =
      `${value * 100}%`;

    if (progressLabel) {
      progressLabel.textContent =
        `${Math.round(value * 100)}%`;
    }
  };

  updateProgress();

  addEventListener(
    "scroll",
    updateProgress,
    {
      passive: true,
    },
  );

  addEventListener(
    "resize",
    updateProgress,
  );

  const toc =
    document.querySelector(
      "[data-on-page-toc]",
    );

  const sections = [
    ...document.querySelectorAll(
      ".lesson-article > section[id]",
    ),
  ];

  if (toc) {
    sections.forEach((section) => {
      const heading =
        section.querySelector("h2");

      if (!heading) return;

      const link =
        document.createElement("a");

      link.href = `#${section.id}`;

      link.textContent =
        heading.textContent.replace(
          /^\d+\.\s*/,
          "",
        );

      toc.appendChild(link);
    });

    const links = [
      ...toc.querySelectorAll("a"),
    ];

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter(
              (entry) =>
                entry.isIntersecting,
            )
            .sort(
              (a, b) =>
                a.boundingClientRect.top -
                b.boundingClientRect.top,
            )[0];

          if (!visible) return;

          links.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.hash ===
                `#${visible.target.id}`,
            );
          });
        },
        {
          rootMargin:
            "-18% 0px -70% 0px",
          threshold: 0,
        },
      );

    sections.forEach((section) =>
      observer.observe(section),
    );
  }

  document
    .querySelectorAll("pre code")
    .forEach((code) => {
      if (window.hljs) {
        hljs.highlightElement(code);
      }

      const pre = code.parentElement;

      if (
        !pre ||
        pre.querySelector(".code-copy")
      ) {
        return;
      }

      const button =
        document.createElement(
          "button",
        );

      button.type = "button";
      button.className = "code-copy";
      button.textContent = "Copy";

      button.addEventListener(
        "click",
        async () => {
          try {
            await navigator.clipboard.writeText(
              code.textContent,
            );

            button.textContent =
              "Copied";
          } catch (_) {
            button.textContent =
              "Select";
          }

          setTimeout(() => {
            button.textContent =
              "Copy";
          }, 1500);
        },
      );

      pre.appendChild(button);
    });

  document
    .querySelectorAll(
      "[data-reveal-answer]",
    )
    .forEach((button) =>
      button.addEventListener(
        "click",
        () => {
          const answer =
            button.nextElementSibling;

          const hidden =
            answer.hasAttribute(
              "hidden",
            );

          if (hidden) {
            answer.removeAttribute(
              "hidden",
            );
          } else {
            answer.setAttribute(
              "hidden",
              "",
            );
          }

          button.textContent =
            hidden
              ? "Hide answer"
              : "Reveal answer";
        },
      ),
    );

  let mermaidRenderSequence =
    Promise.resolve();

  const currentTheme = () =>
    document.documentElement.dataset
      .theme === "light"
      ? "light"
      : "dark";

  const rememberMermaidSources =
    () => {
      document
        .querySelectorAll(".mermaid")
        .forEach((element) => {
          if (
            element.dataset
              .devopsMermaidSource
          ) {
            return;
          }

          if (
            !element.querySelector(
              "svg",
            )
          ) {
            const source =
              element.textContent.trim();

            if (source) {
              element.dataset.devopsMermaidSource =
                source;
            }
          }
        });
    };

  const mermaidConfiguration = (
    theme,
  ) => {
    const dark = theme === "dark";

    return {
      startOnLoad: false,
      securityLevel: "loose",
      theme: "base",

      fontFamily:
        'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

      flowchart: {
        htmlLabels: true,
        curve: "basis",
      },

      themeVariables: dark
        ? {
            darkMode: true,
            background: "#0e121a",

            primaryColor:
              "#14231f",
            primaryTextColor:
              "#f4f7fb",
            primaryBorderColor:
              "#78f5c7",

            secondaryColor:
              "#171d29",
            secondaryTextColor:
              "#f4f7fb",
            secondaryBorderColor:
              "#8da2ff",

            tertiaryColor:
              "#171827",
            tertiaryTextColor:
              "#f4f7fb",
            tertiaryBorderColor:
              "#d68cff",

            lineColor:
              "#97a1b3",
            textColor:
              "#f4f7fb",

            mainBkg:
              "#14231f",
            nodeBorder:
              "#78f5c7",

            clusterBkg:
              "#0b0e14",
            clusterBorder:
              "#3a4b60",

            edgeLabelBackground:
              "#0e121a",
            titleColor:
              "#f4f7fb",

            actorBkg:
              "#14231f",
            actorBorder:
              "#78f5c7",
            actorTextColor:
              "#f4f7fb",

            signalColor:
              "#c5cfdd",
            signalTextColor:
              "#f4f7fb",

            labelBoxBkgColor:
              "#0e121a",
            labelBoxBorderColor:
              "#3a4b60",
            labelTextColor:
              "#f4f7fb",

            loopTextColor:
              "#f4f7fb",

            noteBkgColor:
              "#252b36",
            noteBorderColor:
              "#97a1b3",
            noteTextColor:
              "#f4f7fb",
          }
        : {
            darkMode: false,
            background: "#ffffff",

            primaryColor:
              "#e8f6f1",
            primaryTextColor:
              "#101521",
            primaryBorderColor:
              "#008b69",

            secondaryColor:
              "#edf1ff",
            secondaryTextColor:
              "#101521",
            secondaryBorderColor:
              "#5267da",

            tertiaryColor:
              "#f5eefb",
            tertiaryTextColor:
              "#101521",
            tertiaryBorderColor:
              "#8c52c7",

            lineColor:
              "#536074",
            textColor:
              "#101521",

            mainBkg:
              "#e8f6f1",
            nodeBorder:
              "#008b69",

            clusterBkg:
              "#f8faff",
            clusterBorder:
              "#a7b2c2",

            edgeLabelBackground:
              "#ffffff",
            titleColor:
              "#101521",

            actorBkg:
              "#e8f6f1",
            actorBorder:
              "#008b69",
            actorTextColor:
              "#101521",

            signalColor:
              "#536074",
            signalTextColor:
              "#101521",

            labelBoxBkgColor:
              "#ffffff",
            labelBoxBorderColor:
              "#a7b2c2",
            labelTextColor:
              "#101521",

            loopTextColor:
              "#101521",

            noteBkgColor:
              "#fff6d8",
            noteBorderColor:
              "#9a7b20",
            noteTextColor:
              "#332a10",
          },
    };
  };

  const renderMermaid = (
    theme,
  ) => {
    mermaidRenderSequence =
      mermaidRenderSequence.then(
        async () => {
          if (
            !window.mermaid
              ?.initialize ||
            !window.mermaid?.run
          ) {
            return;
          }

          rememberMermaidSources();

          const nodes = [
            ...document.querySelectorAll(
              ".mermaid",
            ),
          ].filter((element) =>
            Boolean(
              element.dataset
                .devopsMermaidSource,
            ),
          );

          if (!nodes.length) return;

          nodes.forEach(
            (element) => {
              element.removeAttribute(
                "data-processed",
              );

              element.textContent =
                element.dataset
                  .devopsMermaidSource;

              element.setAttribute(
                "aria-busy",
                "true",
              );
            },
          );

          try {
            window.mermaid.initialize(
              mermaidConfiguration(
                theme,
              ),
            );

            await window.mermaid.run({
              nodes,
              suppressErrors: true,
            });

            nodes.forEach(
              (element) =>
                element.removeAttribute(
                  "aria-busy",
                ),
            );

            window.dispatchEvent(
              new CustomEvent(
                "devops-mermaid-rendered",
                {
                  detail: {
                    theme,
                  },
                },
              ),
            );
          } catch (error) {
            nodes.forEach(
              (element) =>
                element.removeAttribute(
                  "aria-busy",
                ),
            );

            console.error(
              "DevOps Academy: diagram rendering failed.",
              error,
            );
          }
        },
      );

    return mermaidRenderSequence;
  };

  rememberMermaidSources();

  renderMermaid(currentTheme());

  window.addEventListener(
    "devops-theme-changed",
    (event) => {
      const theme =
        event.detail?.theme ===
        "light"
          ? "light"
          : "dark";

      renderMermaid(theme);
    },
  );
})();

/* ==========================================================================
   Keep active "On this page" item visible and naturally positioned
   ========================================================================== */

(() => {
  const toc =
    document.querySelector(
      "[data-on-page-toc]",
    );

  if (!toc) return;

  let frameId = null;
  let lastActive = null;

  /*
   * Normal active sections are kept approximately in the middle.
   *
   * However, the TOC CSS contains an artificial ::after spacer so
   * late sections are able to scroll upward.
   *
   * We must NOT use toc.scrollHeight as the bottom boundary because
   * scrollHeight includes that fake spacer.
   *
   * Instead, the bottom boundary is calculated from the last real
   * <a> element.
   *
   * Therefore:
   *
   *   normal section
   *       -> centered
   *
   *   section close to the end
   *       -> center target would exceed the real content
   *       -> clamp to natural bottom
   *
   *   final real TOC link
   *       -> remains at the bottom
   *
   * This also means that when the second-last or third-last section
   * becomes active, the TOC stops scrolling farther down once the
   * final real section has reached the bottom.
   */
  const positionActiveTocItem = (
    smooth = true,
  ) => {
    const links = [
      ...toc.querySelectorAll("a"),
    ];

    const active =
      toc.querySelector(
        "a.is-active",
      );

    if (
      !active ||
      !links.length ||
      active === lastActive
    ) {
      return;
    }

    lastActive = active;

    cancelAnimationFrame(frameId);

    frameId =
      requestAnimationFrame(() => {
        const tocRect =
          toc.getBoundingClientRect();

        const activeRect =
          active.getBoundingClientRect();

        const lastLink =
          links[links.length - 1];

        const lastRect =
          lastLink.getBoundingClientRect();

        /*
         * Convert viewport coordinates into coordinates within the
         * scrollable TOC.
         *
         * Adding toc.scrollTop makes the values independent of the
         * current scroll position.
         */
        const activeTop =
          toc.scrollTop +
          (activeRect.top -
            tocRect.top);

        const lastRealLinkBottom =
          toc.scrollTop +
          (lastRect.bottom -
            tocRect.top);

        /*
         * Keep any real padding you added to the bottom of the TOC.
         * The artificial ::after spacer is deliberately excluded.
         */
        const computed =
          window.getComputedStyle(toc);

        const bottomPadding =
          Number.parseFloat(
            computed.paddingBottom,
          ) || 0;

        /*
         * Preferred position:
         * active section in the vertical center.
         */
        const centeredTarget =
          activeTop -
          toc.clientHeight / 2 +
          activeRect.height / 2;

        /*
         * Maximum natural position:
         * the last actual TOC link at the bottom.
         *
         * This calculation ignores the ::after spacer.
         */
        const naturalBottomTarget =
          Math.max(
            0,
            lastRealLinkBottom +
              bottomPadding -
              toc.clientHeight,
          );

        /*
         * Clamp:
         *
         * centeredTarget
         *     if enough real sections exist below
         *
         * naturalBottomTarget
         *     once the active link gets near the end
         */
        const target = Math.max(
          0,
          Math.min(
            centeredTarget,
            naturalBottomTarget,
          ),
        );

        toc.scrollTo({
          top: target,
          behavior: smooth
            ? "smooth"
            : "auto",
        });
      });
  };

  /*
   * course.js already changes .is-active as different lesson
   * sections become active.
   *
   * Watch those class changes.
   */
  const observer =
    new MutationObserver(
      (mutations) => {
        const activeChanged =
          mutations.some(
            (mutation) =>
              mutation.type ===
                "attributes" &&
              mutation.attributeName ===
                "class" &&
              mutation.target.matches?.(
                "a",
              ),
          );

        if (activeChanged) {
          positionActiveTocItem(
            true,
          );
        }
      },
    );

  observer.observe(toc, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  /*
   * Initial page position.
   */
  window.addEventListener(
    "load",
    () => {
      lastActive = null;
      positionActiveTocItem(false);
    },
  );

  /*
   * Recalculate if viewport/sidebar dimensions change.
   */
  window.addEventListener(
    "resize",
    () => {
      lastActive = null;
      positionActiveTocItem(false);
    },
  );
})();
