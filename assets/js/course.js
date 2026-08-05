(() => {
  const curriculumSearch = document.querySelector('[data-curriculum-search]');
  const chapters = [...document.querySelectorAll('.chapter-card')];
  const curriculumEmpty = document.querySelector('[data-curriculum-empty]');

  curriculumSearch?.addEventListener('input', () => {
    const q = curriculumSearch.value.trim().toLowerCase();
    let visible = 0;
    chapters.forEach(chapter => {
      const match = !q || chapter.textContent.toLowerCase().includes(q);
      chapter.hidden = !match;
      if (match) {
        visible += 1;
        if (q) chapter.open = true;
      }
    });
    if (curriculumEmpty) curriculumEmpty.hidden = visible !== 0;
  });

  const expand = document.querySelector('[data-expand-chapters]');
  let expanded = false;
  expand?.addEventListener('click', () => {
    expanded = !expanded;
    chapters.forEach(chapter => { chapter.open = expanded; });
    expand.textContent = expanded ? 'Collapse all' : 'Expand all';
  });

  const sidebar = document.querySelector('[data-course-sidebar]');
  const shell = document.querySelector('.lesson-shell');
  const sidebarCurriculum = document.querySelector('.sidebar-curriculum');
  const currentSidebarLesson = document.querySelector('.sidebar-lesson.is-current');
  const currentSidebarChapter = currentSidebarLesson?.closest('.sidebar-chapter');

  const alignCurrentSidebarChapter = ({ smooth = false } = {}) => {
    if (!sidebarCurriculum || !currentSidebarChapter) return;
    currentSidebarChapter.open = true;
    currentSidebarLesson?.setAttribute('aria-current', 'page');

    requestAnimationFrame(() => {
      const curriculumRect = sidebarCurriculum.getBoundingClientRect();
      const chapterRect = currentSidebarChapter.getBoundingClientRect();
      const target = sidebarCurriculum.scrollTop + chapterRect.top - curriculumRect.top;
      sidebarCurriculum.scrollTo({
        top: Math.max(0, target),
        behavior: smooth ? 'smooth' : 'auto'
      });
    });
  };

  const openSidebar = () => {
    sidebar?.classList.add('is-open');
    shell?.classList.add('sidebar-open');
    alignCurrentSidebarChapter();
  };
  const closeSidebar = () => {
    sidebar?.classList.remove('is-open');
    shell?.classList.remove('sidebar-open');
  };
  document.querySelector('[data-sidebar-open]')?.addEventListener('click', openSidebar);
  document.querySelector('[data-sidebar-close]')?.addEventListener('click', closeSidebar);
  shell?.addEventListener('click', event => {
    if (shell.classList.contains('sidebar-open') && event.target === shell) closeSidebar();
  });

  const sidebarSearch = document.querySelector('[data-sidebar-search]');
  const sidebarChapters = [...document.querySelectorAll('.sidebar-chapter')];
  sidebarSearch?.addEventListener('input', () => {
    const q = sidebarSearch.value.trim().toLowerCase();
    sidebarChapters.forEach(chapter => {
      const items = [...chapter.querySelectorAll('.sidebar-lesson')];
      let matches = 0;
      items.forEach(item => {
        const show = !q || item.textContent.toLowerCase().includes(q);
        item.hidden = !show;
        if (show) matches += 1;
      });
      chapter.hidden = Boolean(q && matches === 0);
      if (q && matches) chapter.open = true;
    });

    if (!q) alignCurrentSidebarChapter();
  });

  alignCurrentSidebarChapter();
  window.addEventListener('load', () => alignCurrentSidebarChapter());
  window.addEventListener('resize', () => alignCurrentSidebarChapter());

  const article = document.querySelector('.lesson-article');
  const progress = document.querySelector('[data-reading-progress]');
  const progressLabel = document.querySelector('[data-progress-label]');
  const updateProgress = () => {
    if (!article || !progress) return;
    const rect = article.getBoundingClientRect();
    const available = Math.max(1, article.offsetHeight - innerHeight);
    const value = Math.max(0, Math.min(1, -rect.top / available));
    progress.style.width = `${value * 100}%`;
    if (progressLabel) progressLabel.textContent = `${Math.round(value * 100)}%`;
  };
  updateProgress();
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);

  const toc = document.querySelector('[data-on-page-toc]');
  const sections = [...document.querySelectorAll('.lesson-article > section[id]')];
  if (toc) {
    sections.forEach(section => {
      const heading = section.querySelector('h2');
      if (!heading) return;
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      link.textContent = heading.textContent.replace(/^\d+\.\s*/, '');
      toc.appendChild(link);
    });

    const links = [...toc.querySelectorAll('a')];
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      links.forEach(link => link.classList.toggle('is-active', link.hash === `#${visible.target.id}`));
    }, { rootMargin: '-18% 0px -70% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }

  document.querySelectorAll('pre code').forEach(code => {
    if (window.hljs) hljs.highlightElement(code);
    const pre = code.parentElement;
    if (!pre || pre.querySelector('.code-copy')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = 'Copy';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = 'Copied';
      } catch (_) {
        button.textContent = 'Select';
      }
      setTimeout(() => { button.textContent = 'Copy'; }, 1500);
    });
    pre.appendChild(button);
  });

  document.querySelectorAll('[data-reveal-answer]').forEach(button => button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    const hidden = answer.hasAttribute('hidden');
    if (hidden) answer.removeAttribute('hidden');
    else answer.setAttribute('hidden', '');
    button.textContent = hidden ? 'Hide answer' : 'Reveal answer';
  }));

  let mermaidRenderSequence = Promise.resolve();

  const currentTheme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

  const rememberMermaidSources = () => {
    document.querySelectorAll('.mermaid').forEach(element => {
      if (element.dataset.devopsMermaidSource) return;
      if (!element.querySelector('svg')) {
        const source = element.textContent.trim();
        if (source) element.dataset.devopsMermaidSource = source;
      }
    });
  };

  const mermaidConfiguration = theme => {
    const dark = theme === 'dark';
    return {
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'base',
      fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      flowchart: { htmlLabels: true, curve: 'basis' },
      themeVariables: dark ? {
        darkMode: true,
        background: '#0e121a',
        primaryColor: '#14231f',
        primaryTextColor: '#f4f7fb',
        primaryBorderColor: '#78f5c7',
        secondaryColor: '#171d29',
        secondaryTextColor: '#f4f7fb',
        secondaryBorderColor: '#8da2ff',
        tertiaryColor: '#171827',
        tertiaryTextColor: '#f4f7fb',
        tertiaryBorderColor: '#d68cff',
        lineColor: '#97a1b3',
        textColor: '#f4f7fb',
        mainBkg: '#14231f',
        nodeBorder: '#78f5c7',
        clusterBkg: '#0b0e14',
        clusterBorder: '#3a4b60',
        edgeLabelBackground: '#0e121a',
        titleColor: '#f4f7fb',
        actorBkg: '#14231f',
        actorBorder: '#78f5c7',
        actorTextColor: '#f4f7fb',
        signalColor: '#c5cfdd',
        signalTextColor: '#f4f7fb',
        labelBoxBkgColor: '#0e121a',
        labelBoxBorderColor: '#3a4b60',
        labelTextColor: '#f4f7fb',
        loopTextColor: '#f4f7fb',
        noteBkgColor: '#252b36',
        noteBorderColor: '#97a1b3',
        noteTextColor: '#f4f7fb'
      } : {
        darkMode: false,
        background: '#ffffff',
        primaryColor: '#e8f6f1',
        primaryTextColor: '#101521',
        primaryBorderColor: '#008b69',
        secondaryColor: '#edf1ff',
        secondaryTextColor: '#101521',
        secondaryBorderColor: '#5267da',
        tertiaryColor: '#f5eefb',
        tertiaryTextColor: '#101521',
        tertiaryBorderColor: '#8c52c7',
        lineColor: '#536074',
        textColor: '#101521',
        mainBkg: '#e8f6f1',
        nodeBorder: '#008b69',
        clusterBkg: '#f8faff',
        clusterBorder: '#a7b2c2',
        edgeLabelBackground: '#ffffff',
        titleColor: '#101521',
        actorBkg: '#e8f6f1',
        actorBorder: '#008b69',
        actorTextColor: '#101521',
        signalColor: '#536074',
        signalTextColor: '#101521',
        labelBoxBkgColor: '#ffffff',
        labelBoxBorderColor: '#a7b2c2',
        labelTextColor: '#101521',
        loopTextColor: '#101521',
        noteBkgColor: '#fff6d8',
        noteBorderColor: '#9a7b20',
        noteTextColor: '#332a10'
      }
    };
  };

  const renderMermaid = theme => {
    mermaidRenderSequence = mermaidRenderSequence.then(async () => {
      if (!window.mermaid?.initialize || !window.mermaid?.run) return;
      rememberMermaidSources();
      const nodes = [...document.querySelectorAll('.mermaid')]
        .filter(element => Boolean(element.dataset.devopsMermaidSource));
      if (!nodes.length) return;

      nodes.forEach(element => {
        element.removeAttribute('data-processed');
        element.textContent = element.dataset.devopsMermaidSource;
        element.setAttribute('aria-busy', 'true');
      });

      try {
        window.mermaid.initialize(mermaidConfiguration(theme));
        await window.mermaid.run({ nodes, suppressErrors: true });
        nodes.forEach(element => element.removeAttribute('aria-busy'));
        window.dispatchEvent(new CustomEvent('devops-mermaid-rendered', { detail: { theme } }));
      } catch (error) {
        nodes.forEach(element => element.removeAttribute('aria-busy'));
        console.error('DevOps Academy: diagram rendering failed.', error);
      }
    });
    return mermaidRenderSequence;
  };

  rememberMermaidSources();
  renderMermaid(currentTheme());

  window.addEventListener('devops-theme-changed', event => {
    const theme = event.detail?.theme === 'light' ? 'light' : 'dark';
    renderMermaid(theme);
  });
})();
