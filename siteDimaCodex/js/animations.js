document.addEventListener('DOMContentLoaded', () => {
  // ===== Scroll Reveal =====
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== Animated Counter =====
  const counters = document.querySelectorAll('[data-counter], [data-counter-from-date]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = getCounterTarget(el);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current.toLocaleString('ru-RU') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function getCounterTarget(el) {
    if (el.dataset.counterFromDate) {
      const [year, month, day] = el.dataset.counterFromDate.split('-').map(Number);
      const start = new Date(year, month - 1, day);
      const now = new Date();
      let years = now.getFullYear() - start.getFullYear();
      const anniversaryPassed =
        now.getMonth() > start.getMonth() ||
        (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate());

      if (!anniversaryPassed) years -= 1;
      return Math.max(years, 0);
    }

    return parseInt(el.dataset.counter, 10);
  }

  // ===== Hero eye follows pointer =====
  const heroIllustration = document.querySelector('.hero-illustration');
  const heroEye = document.querySelector('.hero-eye-follow');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroIllustration && heroEye && !reducedMotion) {
    const maxX = 16;
    const maxY = 10;

    window.addEventListener('pointermove', (event) => {
      const rect = heroIllustration.getBoundingClientRect();
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;

      if (!isVisible) {
        heroEye.style.transform = 'translate(0, 0)';
        return;
      }

      const x = (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
      const y = (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
      const dx = Math.max(-1, Math.min(1, x)) * maxX;
      const dy = Math.max(-1, Math.min(1, y)) * maxY;

      heroEye.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    window.addEventListener('scroll', () => {
      const rect = heroIllustration.getBoundingClientRect();
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
      if (!isVisible) {
        heroEye.style.transform = 'translate(0, 0)';
      }
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
      heroEye.style.transform = 'translate(0, 0)';
    });
  }

  // ===== Floating Data Stream =====
  const dataStream = document.querySelector('.data-stream');
  if (dataStream) {
    const chars = ['0', '1', '0.73', '1.02', 'EEG', 'μV', 'Hz', '256', '512', 'α', 'β', 'θ', 'δ', 'λ', '0xFF', '0x3A'];
    const columnCount = 15;

    for (let i = 0; i < columnCount; i++) {
      const span = document.createElement('span');
      span.textContent = chars[Math.floor(Math.random() * chars.length)];
      span.style.left = `${(i / columnCount) * 100}%`;
      span.style.animationDelay = `${Math.random() * 12}s`;
      span.style.animationDuration = `${8 + Math.random() * 8}s`;
      dataStream.appendChild(span);
    }
  }

  // ===== Smooth scroll for anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
