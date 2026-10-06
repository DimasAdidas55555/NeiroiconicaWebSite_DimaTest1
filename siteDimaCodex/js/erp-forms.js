document.addEventListener('DOMContentLoaded', () => {
  const aliases = {
    'Айтрекер Нейробюро собственная разработка': 'Стационарный айтрекер',
    'InfraMind II портативная fNIRS-система': 'InfraMind II',
    'NeuroB': 'Айтрекинг-очки NeuroB',
    'Закупка': 'Закупка по 44-ФЗ / 223-ФЗ / ГОЗ',
    'Учимся, играя взглядом': 'Игры',
    'ПланшетПионер': 'Пионер',
    'EyeCommunicator —голос для каждого': 'Пока не знаю',
    'Диагностикаи обучение': 'Пока не знаю'
  };
  document.querySelectorAll('.erp-form').forEach(container => {
    const embed = window.NeiroiconicaERPEmbeds?.[container.dataset.form];
    if (!embed) return;
    const fallback = container.querySelector('.erp-fallback');
    const context = container.querySelector('.erp-context');
    container.innerHTML = embed.html;
    const root = container.querySelector('.ni-crm-form');
    const form = root.querySelector('form');
    if (context) form.querySelector('h3').after(context);
    if (fallback) {
      const line = document.createElement('p');
      line.className = 'erp-email';
      line.append(fallback);
      container.append(line);
    }
    // A single text wrapper keeps checkbox labels readable at narrow widths.
    form.querySelectorAll('.ni-check').forEach(label => {
      const input = label.querySelector('input');
      const text = document.createElement('span');
      [...label.childNodes].filter(node => node !== input).forEach(node => text.append(node));
      label.append(text);
    });
    form.querySelectorAll('input, textarea, select').forEach(field => {
      if (field.required && field.name !== 'consent') {
        const mark = document.createElement('span');
        mark.className = 'erp-required';
        mark.textContent = ' *';
        mark.setAttribute('aria-hidden', 'true');
        field.before(mark);
      }
      if (['name', 'email', 'phone', 'organization'].includes(field.name)) {
        field.autocomplete = field.name === 'phone' ? 'tel' : field.name;
      }
      if (field.tagName === 'TEXTAREA') field.rows = 4;
    });
    const select = form.elements.namedItem('product');
    const setProduct = topic => {
      if (!select) return;
      const value = aliases[topic] || topic;
      // Do not invent ERP options for the cloud or general requests.
      const option = [...select.options].find(option => option.value === value);
      [...select.options].forEach(item => { item.defaultSelected = item === (option || select.options[0]); });
      select.value = option ? value : '';
      if (option && context) context.textContent = `Тема: ${value}`;
      if (option && fallback) fallback.href = `mailto:info@neuroiconica.ru?subject=${encodeURIComponent(value)}`;
    };
    setProduct(container.dataset.product);
    const syncProductLabel = () => {
      if (!select) return;
      if (context) context.textContent = `Тема: ${select.value || container.dataset.product}`;
      if (fallback) fallback.href = `mailto:info@neuroiconica.ru?subject=${encodeURIComponent(select.value || container.dataset.product)}`;
    };
    select?.addEventListener('change', syncProductLabel);
    form.addEventListener('reset', () => queueMicrotask(syncProductLabel));
    container.addEventListener('erp:context', event => setProduct(event.detail.product));
    root.dataset.form = container.dataset.form;
    embed.init(root);
    container.dataset.erpReady = 'true';
  });
});
