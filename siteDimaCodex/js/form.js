document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  // ===== НАСТРОЙКА: Вставьте ваш webhook URL Битрикс24 =====
  const BITRIX_WEBHOOK_URL = 'https://YOUR_DOMAIN.bitrix24.ru/rest/1/YOUR_WEBHOOK_KEY/crm.lead.add.json';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit .btn');
    const statusEl = form.querySelector('.form-status');
    const originalText = submitBtn.textContent;

    // Gather form data
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email) {
      showStatus(statusEl, 'error', 'Пожалуйста, заполните имя и email.');
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    hideStatus(statusEl);

    try {
      const response = await fetch(BITRIX_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            TITLE: `Заявка с сайта: ${name}`,
            NAME: name.split(' ')[0],
            LAST_NAME: name.split(' ').slice(1).join(' ') || '',
            EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
            PHONE: phone ? [{ VALUE: phone, VALUE_TYPE: 'WORK' }] : [],
            COMMENTS: message,
            SOURCE_ID: 'WEB',
          }
        })
      });

      if (response.ok) {
        showStatus(statusEl, 'success', 'Спасибо! Мы свяжемся с вами в ближайшее время.');
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      showStatus(statusEl, 'error', 'Произошла ошибка. Попробуйте позже или свяжитесь с нами напрямую.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  function showStatus(el, type, text) {
    el.className = `form-status ${type}`;
    el.textContent = text;
    el.style.display = 'block';
  }

  function hideStatus(el) {
    el.style.display = 'none';
  }
});
