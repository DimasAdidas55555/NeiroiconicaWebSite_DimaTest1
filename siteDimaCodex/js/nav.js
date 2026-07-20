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
    { name: 'Мультимодальная платформа', path: 'products/neurobureau.html', status: 'ready', desc: 'Ядро экосистемы' },
    { name: 'Анализ эмоций',             path: 'neurobureau/emotions.html',  status: 'soon',  desc: 'Осень 2026' },
    { name: 'Нейробюро.Облако',          path: 'neurobureau/cloud.html',     status: 'ready', desc: 'Совместная аналитика' },
    { name: 'Нейробюро.Чтение',          path: 'neurobureau/reading.html',   status: 'soon',  desc: 'Анализ текстовосприятия' },
    { name: 'Нейробюро.UX',             path: 'neurobureau/ux.html',        status: 'soon',  desc: 'UX-исследования' },
    { name: 'Генератор стимулов',        path: 'neurobureau/stimuli.html',   status: 'soon',  desc: 'Управление экспериментом' },
    { name: 'Образовательный модуль',    path: 'neurobureau/education.html', status: 'soon',  desc: 'Обучение и практикумы' },
    { name: 'Развивающий модуль',        path: 'neurobureau/cognitive.html', status: 'soon',  desc: 'Когнитивные тренировки' },
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
        <span class="flyout-status flyout-status--${m.status}">${m.status === 'soon' ? 'скоро' : ''}</span>
      </a>
    `).join('');
    wrapper.appendChild(flyout);
  });

  // ── Remove "Платформа" link from Нейробюро dropdown ─────────
  document.querySelectorAll('.nav-item').forEach(item => {
    const btn = item.querySelector('.nav-link');
    if (!btn || !btn.textContent.includes('Нейробюро')) return;
    const dropdown = item.querySelector('.nav-dropdown');
    if (!dropdown) return;
    Array.from(dropdown.querySelectorAll('a')).forEach(a => {
      if (a.querySelector('.dropdown-label')?.textContent?.trim() === 'Платформа') a.remove();
    });
  });

  // ── Inject "Документация" link into Нейробюро dropdown ───────
  document.querySelectorAll('.nav-item').forEach(item => {
    const btn = item.querySelector('.nav-link');
    if (!btn || !btn.textContent.includes('Нейробюро')) return;

    const dropdown = item.querySelector('.nav-dropdown');
    if (!dropdown) return;

    // Skip if already injected (check label text specifically, not full link text)
    if (Array.from(dropdown.querySelectorAll('.dropdown-label')).some(el => el.textContent.trim() === 'Документация')) return;

    // Find "Кейсы" link to insert before it
    const casesLink = Array.from(dropdown.querySelectorAll('a')).find(a => a.textContent.includes('Кейсы'));

    const docLink = document.createElement('a');
    docLink.href = pathFromRoot('neurobureau/manual.html');
    docLink.innerHTML = `<span class="dropdown-text"><span class="dropdown-label">Документация</span><span class="dropdown-desc">Руководство пользователя</span></span>`;

    if (casesLink) {
      dropdown.insertBefore(docLink, casesLink);
    } else {
      dropdown.appendChild(docLink);
    }
  });

});
