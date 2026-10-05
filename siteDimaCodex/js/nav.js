document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.nav-burger');
  const menu = document.querySelector('.nav-menu');
  const overlay = document.querySelector('.nav-overlay');
  const navItems = document.querySelectorAll('.nav-item');

  // Toggle mobile menu
  burger?.addEventListener('click', () => {
    burger.classList.toggle('active');
    menu.classList.toggle('open');
    overlay.classList.toggle('visible');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  // Close on overlay click
  overlay?.addEventListener('click', () => {
    burger.classList.remove('active');
    menu.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  });

  // Dropdown toggle
  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');

    link?.addEventListener('click', (e) => {
      const dropdown = item.querySelector('.nav-dropdown');
      if (!dropdown) return;

      e.preventDefault();

      // Close other dropdowns
      navItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('open');
      const expanded = item.classList.contains('open');
      link.setAttribute('aria-expanded', String(expanded));
    });
  });

  // Close dropdowns on outside click (desktop)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      navItems.forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navItems.forEach(item => {
        item.classList.remove('open');
        item.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
      });
      if (menu.classList.contains('open')) {
        burger.classList.remove('active');
        menu.classList.remove('open');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
      }
    }
  });

  // Nav background on scroll
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  }, { passive: true });

  // ── Helpers ──────────────────────────────────────────────────
  function pathFromRoot(relativePath) {
    const navScript = document.currentScript || Array.from(document.scripts).find(script => /(^|\/)nav\.js($|\?)/.test(script.src));
    const scriptUrl = navScript?.src;
    if (scriptUrl) {
      return new URL(relativePath, new URL('../', scriptUrl)).href;
    }
    const depth = Math.max(window.location.pathname.split('/').filter(Boolean).length - 1, 0);
    return '../'.repeat(depth) + relativePath;
  }

  // ── Inject flyout for "Вселенная Нейробюро" ──────────────────
  const modules = [
    { name: 'АПК Нейробюро (ядро)', path: 'products/neurobureau.html', status: 'ready', desc: 'Ядро экосистемы' },
    { name: 'Нейробюро.Эмоции (EmScan)', path: 'products/emscan.html', status: 'ready', desc: 'Анализ эмоций по мимике' },
    { name: 'Нейробюро.Облако',          path: 'neurobureau/cloud.html',     status: 'ready', desc: 'Совместная аналитика' },
    { name: 'Нейробюро.Юзабилити', path: 'neurobureau/ux.html', status: 'year', desc: 'Анализ сайтов и приложений' },
    { name: 'Нейробюро.Практикум', path: 'neurobureau/education.html', status: 'year', desc: 'Лабораторные практикумы' },
    { name: 'Нейробюро.Чтение', path: 'neurobureau/reading.html', status: 'soon', desc: 'Анализ чтения' },
    { name: 'Нейробюро.Стимулы', path: 'neurobureau/stimuli.html', status: 'soon', desc: 'Генерация стимулов' },
    { name: 'Нейробюро.Тренажёр', path: 'neurobureau/cognitive.html', status: 'soon', desc: 'Когнитивные тренировки' },
  ];

  document.querySelectorAll('.nav-dropdown a').forEach(link => {
    if (!link.textContent.includes('Вселенная Нейробюро')) return;

    // Wrap link in flyout trigger div
    const wrapper = document.createElement('div');
    wrapper.className = 'nav-flyout-item';
    link.parentNode.insertBefore(wrapper, link);
    wrapper.appendChild(link);

    // Add chevron to label
    const label = link.querySelector('.dropdown-label');
    if (label) {
      label.insertAdjacentHTML('beforeend',
        '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" style="width:9px;height:9px;display:inline-block;margin-left:5px;vertical-align:middle;opacity:0.6"><path d="M4.5 3L7.5 6L4.5 9"/></svg>'
      );
    }

    // Build flyout panel
    const flyout = document.createElement('div');
    flyout.className = 'nav-flyout';
    flyout.innerHTML = modules.map(m => `
      <a href="${pathFromRoot(m.path)}">
        <span class="dropdown-text">
          <span class="dropdown-label">${m.name}</span>
          <span class="dropdown-desc">${m.desc}</span>
        </span>
        <span class="flyout-status flyout-status--${m.status}">${m.status === 'soon' ? 'скоро' : m.status === 'year' ? 'до конца 2026' : ''}</span>
      </a>
    `).join('');
    wrapper.appendChild(flyout);
  });

  // Documentation returns when the revised manuals are supplied.

});
