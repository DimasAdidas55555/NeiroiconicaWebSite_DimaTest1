document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-case-filters]').forEach(filters => {
    const scope = filters.closest('[data-case-list]');
    const items = [...scope.querySelectorAll('[data-case]')];
    const update = () => {
      let count = 0;
      items.forEach(item => {
        item.hidden = [...filters.querySelectorAll('select')].some(select =>
          select.value && !(item.dataset[select.dataset.filter] || '').split('|').includes(select.value));
        if (!item.hidden) count++;
        if (item.hidden) item.querySelectorAll('video').forEach(video => video.pause());
      });
      scope.querySelector('[data-case-count]').textContent = `Материалов: ${count}`;
      scope.querySelector('[data-case-empty]').hidden = count !== 0;
    };
    filters.addEventListener('change', update);
    filters.querySelector('[type="reset"]')?.addEventListener('click', () => {
      filters.querySelectorAll('select').forEach(select => { select.value = ''; });
      update();
    });
    update();
  });

  // The ERP adapter can read this context when embed codes become available.
  const params = new URLSearchParams(location.search);
  document.querySelectorAll('.erp-form').forEach(form => {
    form.erpContext = {
      form: form.dataset.form, product: form.dataset.product || '',
      source: location.href, timestamp: new Date().toISOString(),
      utm: Object.fromEntries([...params].filter(([key]) => key.startsWith('utm_')))
    };
  });
  document.querySelectorAll('[data-request-product]').forEach(link => {
    link.addEventListener('click', () => {
      const id = (link.getAttribute('href') || '').split('#')[1];
      const form = id && document.getElementById(id);
      if (!form?.classList.contains('erp-form')) return;
      form.erpContext.product = link.dataset.requestProduct;
      form.dataset.product = link.dataset.requestProduct;
      const context = form.querySelector('.erp-context');
      if (context) context.textContent = `Тема: ${link.dataset.requestProduct}`;
      const email = form.querySelector('.erp-fallback');
      if (email) email.href = `mailto:info@neuroiconica.ru?subject=${encodeURIComponent(link.dataset.requestProduct)}`;
      form.dispatchEvent(new CustomEvent('erp:context', {detail: form.erpContext}));
    });
  });
});
