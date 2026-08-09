(() => {
  const root = document.documentElement;
  const scriptUrl = document.currentScript?.src;

  const loadSiteFixes = () => {
    if (!scriptUrl || document.querySelector('link[data-devops-site-fixes]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('../css/site-fixes.css', scriptUrl).href;
    link.dataset.devopsSiteFixes = '';
    document.head.appendChild(link);
  };

  loadSiteFixes();

  const themeButtons = [...document.querySelectorAll('[data-theme-toggle]')];
  const darkTheme = document.getElementById('hljs-theme-dark');
  const lightTheme = document.getElementById('hljs-theme-light');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const ICONS = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
    moon: '<path d="M20.4 15.1A8.5 8.5 0 0 1 8.9 3.6 8.5 8.5 0 1 0 20.4 15.1Z"/>'
  };

  const currentTheme = () => root.dataset.theme === 'light' ? 'light' : 'dark';

  const updateThemeButtons = () => {
    const theme = currentTheme();
    const isDark = theme === 'dark';
    const action = isDark ? 'Switch to light theme' : 'Switch to dark theme';

    themeButtons.forEach(button => {
      button.setAttribute('aria-label', action);
      button.setAttribute('title', action);
      button.setAttribute('aria-pressed', String(isDark));
      button.dataset.themeState = theme;

      const svg = button.querySelector('svg');
      if (svg) {
        svg.innerHTML = isDark ? ICONS.sun : ICONS.moon;
      }
    });
  };

  const applyThemeAssets = () => {
    const light = currentTheme() === 'light';
    if (darkTheme) darkTheme.disabled = light;
    if (lightTheme) lightTheme.disabled = !light;
    if (themeColor) themeColor.setAttribute('content', light ? '#f5f7fb' : '#07090d');
    root.style.colorScheme = light ? 'light' : 'dark';
    updateThemeButtons();
  };

  applyThemeAssets();

  themeButtons.forEach(button => button.addEventListener('click', () => {
    const next = currentTheme() === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('devops-academy-theme', next); } catch (_) {}
    applyThemeAssets();
    window.dispatchEvent(new CustomEvent('devops-theme-changed', { detail: { theme: next } }));
  }));

  const header = document.querySelector('[data-header]');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const menuButton = document.querySelector('[data-mobile-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  menuButton?.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: .08, rootMargin: '0px 0px -35px' });
    reveal.forEach(el => observer.observe(el));
  } else {
    reveal.forEach(el => el.classList.add('is-visible'));
  }

  const cards = [...document.querySelectorAll('[data-course-card]')];
  const search = document.querySelector('[data-course-search]');
  const filters = [...document.querySelectorAll('[data-course-filter]')];
  const count = document.querySelector('[data-course-count]');
  const empty = document.querySelector('[data-empty-state]');
  let activeFilter = 'all';

  const updateCatalog = () => {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const show = (activeFilter === 'all' || card.dataset.stage === activeFilter) &&
        (!query || card.dataset.search.includes(query));
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = `${visible} course${visible === 1 ? '' : 's'}`;
    if (empty) empty.hidden = visible !== 0;
  };

  search?.addEventListener('input', updateCatalog);
  filters.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.courseFilter;
    filters.forEach(x => x.classList.toggle('is-active', x === button));
    updateCatalog();
  }));

  const filterToggle = document.querySelector('[data-filter-toggle]');
  const filterRow = document.querySelector('[data-filter-row]');
  filterToggle?.addEventListener('click', () => filterRow?.classList.toggle('is-open'));

  document.querySelectorAll('[data-copy-wallet]').forEach(button => button.addEventListener('click', async () => {
    const address = button.closest('.wallet-card')?.querySelector('[data-wallet-address]')?.textContent.trim();
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      button.querySelector('span').textContent = 'Copied';
    } catch (_) {
      button.querySelector('span').textContent = 'Select address';
    }
    setTimeout(() => {
      const label = button.querySelector('span');
      if (label) label.textContent = 'Copy address';
    }, 1800);
  }));

  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();