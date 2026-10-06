# Коды вставки форм сайта (ERP)

Каждый блок ниже — готовый код формы из ERP («Формы сайта» → «Код» → «Скопировать код»). Вставлять блок целиком (HTML + JavaScript + стили) на нужную страницу вместо кнопки с mailto. Подробности: Сайт_формы_для_Димы.md.

Форма принимает заявки только со страниц домена neuroiconica.ru.


## F1. Связаться (site-contact)

~~~~html
<div class="ni-crm-form" id="ni-crm-site-contact">
  <form novalidate>
    <h3>Связаться с нами</h3>
    <p>Напишите нам: ответим в течение рабочего дня.</p>
    <label>Имя<input type="text" name="name" maxlength="500" placeholder="Как к вам обращаться" required></label>
    <label>Телефон<input type="tel" name="phone" maxlength="500" placeholder="+7 999 000-00-00"></label>
    <label>Email<input type="email" name="email" maxlength="500" placeholder="name@example.ru" required></label>
    <label>Ваш вопрос<textarea name="message" maxlength="500" placeholder="Опишите ваш запрос"></textarea></label>
    <label>Если письмо не дойдёт, как ещё с вами связаться?<select name="second_channel" required><option value="">Выберите…</option><option value="Звонок">Звонок</option><option value="Telegram">Telegram</option><option value="MAX">MAX</option></select></label>
    <label>Номер телефона или @ник<input type="text" name="second_channel_value" maxlength="500" placeholder="Для выбранного способа связи"></label>
    <label class="ni-check"><input type="checkbox" name="consent" required> Я согласен на обработку персональных данных. <a href="https://neuroiconica.ru/agreement/" target="_blank" rel="noopener">Подробнее</a></label>
    <input class="ni-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button type="submit">Отправить</button>
    <p class="ni-result" role="status" aria-live="polite"></p>
  </form>
</div>
<style>
#ni-crm-site-contact form{display:grid;gap:14px;max-width:560px}
#ni-crm-site-contact label{display:grid;gap:5px}
#ni-crm-site-contact input,#ni-crm-site-contact textarea,#ni-crm-site-contact select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d8dce3;border-radius:6px}
#ni-crm-site-contact .ni-check{display:flex;align-items:flex-start;gap:8px}
#ni-crm-site-contact .ni-check input{width:auto;margin-top:4px}
#ni-crm-site-contact button{padding:11px 18px;cursor:pointer}
#ni-crm-site-contact .ni-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important}
</style>
<script>
(() => {
  const root = document.getElementById("ni-crm-site-contact");
  const form = root && root.querySelector('form');
  if (!form || form.dataset.crmBound) return;
  form.dataset.crmBound = '1';
  const fields = [{"key":"name","kind":"text"},{"key":"phone","kind":"tel"},{"key":"email","kind":"email"},{"key":"message","kind":"textarea"},{"key":"second_channel","kind":"select"},{"key":"second_channel_value","kind":"text"}];
  const allowedFieldKeys = new Set(fields.map(({ key }) => key));
  const makeUuid = () => {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  };
  const readTracking = () => {
    const query = new URLSearchParams(window.location.search);
    const tracking = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','yclid'].forEach((key) => {
      if (query.get(key)) tracking[key] = query.get(key).slice(0, 300);
    });
    return tracking;
  };
  const placementContext = () => ({
    page_url: window.location.href,
    page_title: document.title.slice(0, 500),
    source: 'wordpress',
  });
  const sessionContext = () => ({
    ...placementContext(),
    referrer: document.referrer || null,
  });
  const submissionContext = () => ({
    source_url: window.location.href,
    page_title: document.title.slice(0, 500),
    referrer: document.referrer || null,
  });
  const telemetry = (url, method, payload) => {
    try {
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => null);
    } catch {
      return Promise.resolve(null);
    }
  };
  let requestKey = makeUuid();
  let sessionId = makeUuid();
  let formStartedAt = null;
  let telemetryTimer = null;
  const touchedFields = new Set();

  void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-contact/placements", 'POST', placementContext());

  const sendSession = () => {
    if (!formStartedAt) return;
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = null;
    void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-contact/sessions" + '/' + encodeURIComponent(sessionId), 'PUT', {
      ...sessionContext(),
      touched_fields: Array.from(touchedFields),
      utm: readTracking(),
      started_at: formStartedAt,
    });
  };
  const noteInteraction = (event) => {
    const key = event.target && event.target.name;
    if (!allowedFieldKeys.has(key)) return;
    touchedFields.add(key);
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = window.setTimeout(sendSession, 800);
  };
  ['focusin', 'input', 'change'].forEach((name) => form.addEventListener(name, noteInteraction));
  window.addEventListener('pagehide', sendSession);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    sendSession();
    const data = new FormData(form);
    const values = {};
    fields.forEach(({ key, kind }) => {
      values[key] = kind === 'checkbox' ? data.has(key) : String(data.get(key) || '');
    });
    const button = form.querySelector('button[type="submit"]');
    const result = form.querySelector('.ni-result');
    button.disabled = true;
    result.textContent = 'Отправляем…';
    try {
      const response = await fetch("https://erp.neuroiconica.ru/api/v1/public/forms/site-contact/submissions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': requestKey,
        },
        body: JSON.stringify({
          fields: values,
          consent: data.has('consent'),
          honeypot: String(data.get('website') || ''),
          ...submissionContext(),
          utm: readTracking(),
          form_started_at: formStartedAt,
          session_id: sessionId,
        }),
      });
      if (!response.ok) throw new Error('submit failed');
      const payload = await response.json();
      form.reset();
      result.textContent = payload.message || "Спасибо! Мы ответим на указанный email в течение рабочего дня. Если письма нет, проверьте папку «Спам».";
      requestKey = makeUuid();
      sessionId = makeUuid();
      formStartedAt = null;
      touchedFields.clear();
    } catch {
      result.textContent = 'Не удалось отправить заявку. Позвоните нам или повторите попытку позже.';
    } finally {
      button.disabled = false;
    }
  });
})();
</script>
~~~~


## F2. Запросить демо или расчёт, наука (site-demo-science)

~~~~html
<div class="ni-crm-form" id="ni-crm-site-demo-science">
  <form novalidate>
    <h3>Запросить демо или расчёт</h3>
    <p>Расскажите о задаче, и мы подберём решение под вашу лабораторию.</p>
    <label>Имя<input type="text" name="name" maxlength="500" placeholder="Как к вам обращаться" required></label>
    <label>Телефон<input type="tel" name="phone" maxlength="500" placeholder="+7 999 000-00-00"></label>
    <label>Email<input type="email" name="email" maxlength="500" placeholder="name@example.ru" required></label>
    <label>Расскажите о задаче<textarea name="message" maxlength="500" placeholder="Что вы хотите исследовать или измерить?"></textarea></label>
    <label>Организация<input type="text" name="organization" maxlength="500" placeholder="Название организации"></label>
    <label>Должность<input type="text" name="position" maxlength="500" placeholder="Ваша должность"></label>
    <label>Что вас интересует<select name="product" required><option value="">Выберите…</option><option value="АПК Нейробюро">АПК Нейробюро</option><option value="Стационарный айтрекер">Стационарный айтрекер</option><option value="EmScan">EmScan</option><option value="EmScan для отелей">EmScan для отелей</option><option value="Айтрекинг-очки NeuroB">Айтрекинг-очки NeuroB</option><option value="Экранированные камеры">Экранированные камеры</option><option value="aSee Glasses">aSee Glasses</option><option value="InfraMind II">InfraMind II</option><option value="Закупка по 44-ФЗ / 223-ФЗ / ГОЗ">Закупка по 44-ФЗ / 223-ФЗ / ГОЗ</option><option value="Подбор частоты">Подбор частоты</option><option value="Другое">Другое</option></select></label>
    <label>Если письмо не дойдёт, как ещё с вами связаться?<select name="second_channel" required><option value="">Выберите…</option><option value="Звонок">Звонок</option><option value="Telegram">Telegram</option><option value="MAX">MAX</option></select></label>
    <label>Номер телефона или @ник<input type="text" name="second_channel_value" maxlength="500" placeholder="Для выбранного способа связи"></label>
    <label class="ni-check"><input type="checkbox" name="consent" required> Я согласен на обработку персональных данных. <a href="https://neuroiconica.ru/agreement/" target="_blank" rel="noopener">Подробнее</a></label>
    <input class="ni-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button type="submit">Отправить</button>
    <p class="ni-result" role="status" aria-live="polite"></p>
  </form>
</div>
<style>
#ni-crm-site-demo-science form{display:grid;gap:14px;max-width:560px}
#ni-crm-site-demo-science label{display:grid;gap:5px}
#ni-crm-site-demo-science input,#ni-crm-site-demo-science textarea,#ni-crm-site-demo-science select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d8dce3;border-radius:6px}
#ni-crm-site-demo-science .ni-check{display:flex;align-items:flex-start;gap:8px}
#ni-crm-site-demo-science .ni-check input{width:auto;margin-top:4px}
#ni-crm-site-demo-science button{padding:11px 18px;cursor:pointer}
#ni-crm-site-demo-science .ni-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important}
</style>
<script>
(() => {
  const root = document.getElementById("ni-crm-site-demo-science");
  const form = root && root.querySelector('form');
  if (!form || form.dataset.crmBound) return;
  form.dataset.crmBound = '1';
  const fields = [{"key":"name","kind":"text"},{"key":"phone","kind":"tel"},{"key":"email","kind":"email"},{"key":"message","kind":"textarea"},{"key":"organization","kind":"text"},{"key":"position","kind":"text"},{"key":"product","kind":"select"},{"key":"second_channel","kind":"select"},{"key":"second_channel_value","kind":"text"}];
  const allowedFieldKeys = new Set(fields.map(({ key }) => key));
  const makeUuid = () => {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  };
  const readTracking = () => {
    const query = new URLSearchParams(window.location.search);
    const tracking = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','yclid'].forEach((key) => {
      if (query.get(key)) tracking[key] = query.get(key).slice(0, 300);
    });
    return tracking;
  };
  const placementContext = () => ({
    page_url: window.location.href,
    page_title: document.title.slice(0, 500),
    source: 'wordpress',
  });
  const sessionContext = () => ({
    ...placementContext(),
    referrer: document.referrer || null,
  });
  const submissionContext = () => ({
    source_url: window.location.href,
    page_title: document.title.slice(0, 500),
    referrer: document.referrer || null,
  });
  const telemetry = (url, method, payload) => {
    try {
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => null);
    } catch {
      return Promise.resolve(null);
    }
  };
  let requestKey = makeUuid();
  let sessionId = makeUuid();
  let formStartedAt = null;
  let telemetryTimer = null;
  const touchedFields = new Set();

  void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-demo-science/placements", 'POST', placementContext());

  const sendSession = () => {
    if (!formStartedAt) return;
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = null;
    void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-demo-science/sessions" + '/' + encodeURIComponent(sessionId), 'PUT', {
      ...sessionContext(),
      touched_fields: Array.from(touchedFields),
      utm: readTracking(),
      started_at: formStartedAt,
    });
  };
  const noteInteraction = (event) => {
    const key = event.target && event.target.name;
    if (!allowedFieldKeys.has(key)) return;
    touchedFields.add(key);
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = window.setTimeout(sendSession, 800);
  };
  ['focusin', 'input', 'change'].forEach((name) => form.addEventListener(name, noteInteraction));
  window.addEventListener('pagehide', sendSession);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    sendSession();
    const data = new FormData(form);
    const values = {};
    fields.forEach(({ key, kind }) => {
      values[key] = kind === 'checkbox' ? data.has(key) : String(data.get(key) || '');
    });
    const button = form.querySelector('button[type="submit"]');
    const result = form.querySelector('.ni-result');
    button.disabled = true;
    result.textContent = 'Отправляем…';
    try {
      const response = await fetch("https://erp.neuroiconica.ru/api/v1/public/forms/site-demo-science/submissions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': requestKey,
        },
        body: JSON.stringify({
          fields: values,
          consent: data.has('consent'),
          honeypot: String(data.get('website') || ''),
          ...submissionContext(),
          utm: readTracking(),
          form_started_at: formStartedAt,
          session_id: sessionId,
        }),
      });
      if (!response.ok) throw new Error('submit failed');
      const payload = await response.json();
      form.reset();
      result.textContent = payload.message || "Спасибо! Мы ответим на указанный email в течение рабочего дня. Если письма нет, проверьте папку «Спам».";
      requestKey = makeUuid();
      sessionId = makeUuid();
      formStartedAt = null;
      touchedFields.clear();
    } catch {
      result.textContent = 'Не удалось отправить заявку. Позвоните нам или повторите попытку позже.';
    } finally {
      button.disabled = false;
    }
  });
})();
</script>
~~~~


## F3. Узнать первыми (site-notify)

~~~~html
<div class="ni-crm-form" id="ni-crm-site-notify">
  <form novalidate>
    <h3>Узнать первыми</h3>
    <p>Оставьте email: сообщим о выходе и пришлём подробности.</p>
    <label>Имя<input type="text" name="name" maxlength="500" placeholder="Как к вам обращаться"></label>
    <label>Email<input type="email" name="email" maxlength="500" placeholder="name@example.ru" required></label>
    <label>О каком продукте сообщить<select name="product" required><option value="">Выберите…</option><option value="Нейробюро.Практикум">Нейробюро.Практикум</option><option value="Нейробюро.Юзабилити">Нейробюро.Юзабилити</option><option value="Нейробюро.Чтение">Нейробюро.Чтение</option><option value="Нейробюро.Стимулы">Нейробюро.Стимулы</option><option value="Нейробюро.Тренажёр">Нейробюро.Тренажёр</option></select></label>
    <label>Кто вы<select name="role"><option value="">Выберите…</option><option value="Учитель">Учитель</option><option value="Преподаватель вуза">Преподаватель вуза</option><option value="Исследователь">Исследователь</option><option value="Студент">Студент</option><option value="Другое">Другое</option></select></label>
    <label>Если письмо не дойдёт, как ещё с вами связаться?<select name="second_channel"><option value="">Выберите…</option><option value="Звонок">Звонок</option><option value="Telegram">Telegram</option><option value="MAX">MAX</option></select></label>
    <label>Номер телефона или @ник<input type="text" name="second_channel_value" maxlength="500" placeholder=""></label>
    <label class="ni-check"><input type="checkbox" name="consent" required> Я согласен на обработку персональных данных. <a href="https://neuroiconica.ru/agreement/" target="_blank" rel="noopener">Подробнее</a></label>
    <input class="ni-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button type="submit">Отправить</button>
    <p class="ni-result" role="status" aria-live="polite"></p>
  </form>
</div>
<style>
#ni-crm-site-notify form{display:grid;gap:14px;max-width:560px}
#ni-crm-site-notify label{display:grid;gap:5px}
#ni-crm-site-notify input,#ni-crm-site-notify textarea,#ni-crm-site-notify select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d8dce3;border-radius:6px}
#ni-crm-site-notify .ni-check{display:flex;align-items:flex-start;gap:8px}
#ni-crm-site-notify .ni-check input{width:auto;margin-top:4px}
#ni-crm-site-notify button{padding:11px 18px;cursor:pointer}
#ni-crm-site-notify .ni-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important}
</style>
<script>
(() => {
  const root = document.getElementById("ni-crm-site-notify");
  const form = root && root.querySelector('form');
  if (!form || form.dataset.crmBound) return;
  form.dataset.crmBound = '1';
  const fields = [{"key":"name","kind":"text"},{"key":"email","kind":"email"},{"key":"product","kind":"select"},{"key":"role","kind":"select"},{"key":"second_channel","kind":"select"},{"key":"second_channel_value","kind":"text"}];
  const allowedFieldKeys = new Set(fields.map(({ key }) => key));
  const makeUuid = () => {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  };
  const readTracking = () => {
    const query = new URLSearchParams(window.location.search);
    const tracking = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','yclid'].forEach((key) => {
      if (query.get(key)) tracking[key] = query.get(key).slice(0, 300);
    });
    return tracking;
  };
  const placementContext = () => ({
    page_url: window.location.href,
    page_title: document.title.slice(0, 500),
    source: 'wordpress',
  });
  const sessionContext = () => ({
    ...placementContext(),
    referrer: document.referrer || null,
  });
  const submissionContext = () => ({
    source_url: window.location.href,
    page_title: document.title.slice(0, 500),
    referrer: document.referrer || null,
  });
  const telemetry = (url, method, payload) => {
    try {
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => null);
    } catch {
      return Promise.resolve(null);
    }
  };
  let requestKey = makeUuid();
  let sessionId = makeUuid();
  let formStartedAt = null;
  let telemetryTimer = null;
  const touchedFields = new Set();

  void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-notify/placements", 'POST', placementContext());

  const sendSession = () => {
    if (!formStartedAt) return;
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = null;
    void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-notify/sessions" + '/' + encodeURIComponent(sessionId), 'PUT', {
      ...sessionContext(),
      touched_fields: Array.from(touchedFields),
      utm: readTracking(),
      started_at: formStartedAt,
    });
  };
  const noteInteraction = (event) => {
    const key = event.target && event.target.name;
    if (!allowedFieldKeys.has(key)) return;
    touchedFields.add(key);
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = window.setTimeout(sendSession, 800);
  };
  ['focusin', 'input', 'change'].forEach((name) => form.addEventListener(name, noteInteraction));
  window.addEventListener('pagehide', sendSession);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    sendSession();
    const data = new FormData(form);
    const values = {};
    fields.forEach(({ key, kind }) => {
      values[key] = kind === 'checkbox' ? data.has(key) : String(data.get(key) || '');
    });
    const button = form.querySelector('button[type="submit"]');
    const result = form.querySelector('.ni-result');
    button.disabled = true;
    result.textContent = 'Отправляем…';
    try {
      const response = await fetch("https://erp.neuroiconica.ru/api/v1/public/forms/site-notify/submissions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': requestKey,
        },
        body: JSON.stringify({
          fields: values,
          consent: data.has('consent'),
          honeypot: String(data.get('website') || ''),
          ...submissionContext(),
          utm: readTracking(),
          form_started_at: formStartedAt,
          session_id: sessionId,
        }),
      });
      if (!response.ok) throw new Error('submit failed');
      const payload = await response.json();
      form.reset();
      result.textContent = payload.message || "Спасибо! Мы сообщим о выходе на указанный email. Если письма нет, проверьте папку «Спам».";
      requestKey = makeUuid();
      sessionId = makeUuid();
      formStartedAt = null;
      touchedFields.clear();
    } catch {
      result.textContent = 'Не удалось отправить заявку. Позвоните нам или повторите попытку позже.';
    } finally {
      button.disabled = false;
    }
  });
})();
</script>
~~~~


## F4. Заявка на обучение (site-training)

~~~~html
<div class="ni-crm-form" id="ni-crm-site-training">
  <form novalidate>
    <h3>Обсудить обучение</h3>
    <p>Расскажите о вашей команде, и мы предложим программу обучения.</p>
    <label>Имя<input type="text" name="name" maxlength="500" placeholder="Как к вам обращаться" required></label>
    <label>Телефон<input type="tel" name="phone" maxlength="500" placeholder="+7 999 000-00-00"></label>
    <label>Email<input type="email" name="email" maxlength="500" placeholder="name@example.ru" required></label>
    <label>Тема или программа<textarea name="message" maxlength="500" placeholder="Чему хотите научиться?"></textarea></label>
    <label>Организация<input type="text" name="organization" maxlength="500" placeholder="Название организации"></label>
    <label>Формат обучения<select name="format"><option value="">Выберите…</option><option value="Онлайн">Онлайн</option><option value="Очно">Очно</option><option value="Пока не знаю">Пока не знаю</option></select></label>
    <label>Размер группы<input type="text" name="group_size" maxlength="500" placeholder="Сколько человек будет учиться"></label>
    <label>Уровень подготовки<select name="level"><option value="">Выберите…</option><option value="Начальный">Начальный</option><option value="Продвинутый">Продвинутый</option><option value="Не знаю">Не знаю</option></select></label>
    <label>Если письмо не дойдёт, как ещё с вами связаться?<select name="second_channel" required><option value="">Выберите…</option><option value="Звонок">Звонок</option><option value="Telegram">Telegram</option><option value="MAX">MAX</option></select></label>
    <label>Номер телефона или @ник<input type="text" name="second_channel_value" maxlength="500" placeholder=""></label>
    <label class="ni-check"><input type="checkbox" name="consent" required> Я согласен на обработку персональных данных. <a href="https://neuroiconica.ru/agreement/" target="_blank" rel="noopener">Подробнее</a></label>
    <input class="ni-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button type="submit">Отправить</button>
    <p class="ni-result" role="status" aria-live="polite"></p>
  </form>
</div>
<style>
#ni-crm-site-training form{display:grid;gap:14px;max-width:560px}
#ni-crm-site-training label{display:grid;gap:5px}
#ni-crm-site-training input,#ni-crm-site-training textarea,#ni-crm-site-training select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d8dce3;border-radius:6px}
#ni-crm-site-training .ni-check{display:flex;align-items:flex-start;gap:8px}
#ni-crm-site-training .ni-check input{width:auto;margin-top:4px}
#ni-crm-site-training button{padding:11px 18px;cursor:pointer}
#ni-crm-site-training .ni-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important}
</style>
<script>
(() => {
  const root = document.getElementById("ni-crm-site-training");
  const form = root && root.querySelector('form');
  if (!form || form.dataset.crmBound) return;
  form.dataset.crmBound = '1';
  const fields = [{"key":"name","kind":"text"},{"key":"phone","kind":"tel"},{"key":"email","kind":"email"},{"key":"message","kind":"textarea"},{"key":"organization","kind":"text"},{"key":"format","kind":"select"},{"key":"group_size","kind":"text"},{"key":"level","kind":"select"},{"key":"second_channel","kind":"select"},{"key":"second_channel_value","kind":"text"}];
  const allowedFieldKeys = new Set(fields.map(({ key }) => key));
  const makeUuid = () => {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  };
  const readTracking = () => {
    const query = new URLSearchParams(window.location.search);
    const tracking = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','yclid'].forEach((key) => {
      if (query.get(key)) tracking[key] = query.get(key).slice(0, 300);
    });
    return tracking;
  };
  const placementContext = () => ({
    page_url: window.location.href,
    page_title: document.title.slice(0, 500),
    source: 'wordpress',
  });
  const sessionContext = () => ({
    ...placementContext(),
    referrer: document.referrer || null,
  });
  const submissionContext = () => ({
    source_url: window.location.href,
    page_title: document.title.slice(0, 500),
    referrer: document.referrer || null,
  });
  const telemetry = (url, method, payload) => {
    try {
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => null);
    } catch {
      return Promise.resolve(null);
    }
  };
  let requestKey = makeUuid();
  let sessionId = makeUuid();
  let formStartedAt = null;
  let telemetryTimer = null;
  const touchedFields = new Set();

  void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-training/placements", 'POST', placementContext());

  const sendSession = () => {
    if (!formStartedAt) return;
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = null;
    void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-training/sessions" + '/' + encodeURIComponent(sessionId), 'PUT', {
      ...sessionContext(),
      touched_fields: Array.from(touchedFields),
      utm: readTracking(),
      started_at: formStartedAt,
    });
  };
  const noteInteraction = (event) => {
    const key = event.target && event.target.name;
    if (!allowedFieldKeys.has(key)) return;
    touchedFields.add(key);
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = window.setTimeout(sendSession, 800);
  };
  ['focusin', 'input', 'change'].forEach((name) => form.addEventListener(name, noteInteraction));
  window.addEventListener('pagehide', sendSession);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    sendSession();
    const data = new FormData(form);
    const values = {};
    fields.forEach(({ key, kind }) => {
      values[key] = kind === 'checkbox' ? data.has(key) : String(data.get(key) || '');
    });
    const button = form.querySelector('button[type="submit"]');
    const result = form.querySelector('.ni-result');
    button.disabled = true;
    result.textContent = 'Отправляем…';
    try {
      const response = await fetch("https://erp.neuroiconica.ru/api/v1/public/forms/site-training/submissions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': requestKey,
        },
        body: JSON.stringify({
          fields: values,
          consent: data.has('consent'),
          honeypot: String(data.get('website') || ''),
          ...submissionContext(),
          utm: readTracking(),
          form_started_at: formStartedAt,
          session_id: sessionId,
        }),
      });
      if (!response.ok) throw new Error('submit failed');
      const payload = await response.json();
      form.reset();
      result.textContent = payload.message || "Спасибо! Мы ответим на указанный email в течение рабочего дня. Если письма нет, проверьте папку «Спам».";
      requestKey = makeUuid();
      sessionId = makeUuid();
      formStartedAt = null;
      touchedFields.clear();
    } catch {
      result.textContent = 'Не удалось отправить заявку. Позвоните нам или повторите попытку позже.';
    } finally {
      button.disabled = false;
    }
  });
})();
</script>
~~~~


## F6. Расскажите свою историю, ассистив (site-story-assistive)

~~~~html
<div class="ni-crm-form" id="ni-crm-site-story-assistive">
  <form novalidate>
    <h3>Расскажите свою историю</h3>
    <p>Поделитесь опытом: опубликуем историю с вашего согласия и поможем другим увидеть, как это работает.</p>
    <label>Имя<input type="text" name="name" maxlength="500" placeholder="Как к вам обращаться" required></label>
    <label>Телефон<input type="tel" name="phone" maxlength="500" placeholder="+7 999 000-00-00"></label>
    <label>Email<input type="email" name="email" maxlength="500" placeholder="name@example.ru" required></label>
    <label>Ваша история<textarea name="message" maxlength="500" placeholder="Расскажите, как технология изменила жизнь" required></textarea></label>
    <label>Кем вы являетесь<select name="who" required><option value="">Выберите…</option><option value="Пользователь">Пользователь</option><option value="Родитель или близкий">Родитель или близкий</option><option value="Специалист">Специалист</option></select></label>
    <label>Что используете<select name="product"><option value="">Выберите…</option><option value="Стерх">Стерх</option><option value="Пионер">Пионер</option><option value="Eyecommunicator">Eyecommunicator</option><option value="Игры">Игры</option></select></label>
    <label>Если письмо не дойдёт, как ещё с вами связаться?<select name="second_channel" required><option value="">Выберите…</option><option value="Звонок">Звонок</option><option value="Telegram">Telegram</option><option value="MAX">MAX</option></select></label>
    <label>Номер телефона или @ник<input type="text" name="second_channel_value" maxlength="500" placeholder="Для выбранного способа связи"></label>
    <label class="ni-check"><input type="checkbox" name="publish_consent"> Разрешаю опубликовать мою историю после согласования</label>
    <label class="ni-check"><input type="checkbox" name="consent" required> Я согласен на обработку персональных данных. <a href="https://neuroiconica.ru/agreement/" target="_blank" rel="noopener">Подробнее</a></label>
    <input class="ni-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button type="submit">Отправить</button>
    <p class="ni-result" role="status" aria-live="polite"></p>
  </form>
</div>
<style>
#ni-crm-site-story-assistive form{display:grid;gap:14px;max-width:560px}
#ni-crm-site-story-assistive label{display:grid;gap:5px}
#ni-crm-site-story-assistive input,#ni-crm-site-story-assistive textarea,#ni-crm-site-story-assistive select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d8dce3;border-radius:6px}
#ni-crm-site-story-assistive .ni-check{display:flex;align-items:flex-start;gap:8px}
#ni-crm-site-story-assistive .ni-check input{width:auto;margin-top:4px}
#ni-crm-site-story-assistive button{padding:11px 18px;cursor:pointer}
#ni-crm-site-story-assistive .ni-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important}
</style>
<script>
(() => {
  const root = document.getElementById("ni-crm-site-story-assistive");
  const form = root && root.querySelector('form');
  if (!form || form.dataset.crmBound) return;
  form.dataset.crmBound = '1';
  const fields = [{"key":"name","kind":"text"},{"key":"phone","kind":"tel"},{"key":"email","kind":"email"},{"key":"message","kind":"textarea"},{"key":"who","kind":"select"},{"key":"product","kind":"select"},{"key":"second_channel","kind":"select"},{"key":"second_channel_value","kind":"text"},{"key":"publish_consent","kind":"checkbox"}];
  const allowedFieldKeys = new Set(fields.map(({ key }) => key));
  const makeUuid = () => {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  };
  const readTracking = () => {
    const query = new URLSearchParams(window.location.search);
    const tracking = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','yclid'].forEach((key) => {
      if (query.get(key)) tracking[key] = query.get(key).slice(0, 300);
    });
    return tracking;
  };
  const placementContext = () => ({
    page_url: window.location.href,
    page_title: document.title.slice(0, 500),
    source: 'wordpress',
  });
  const sessionContext = () => ({
    ...placementContext(),
    referrer: document.referrer || null,
  });
  const submissionContext = () => ({
    source_url: window.location.href,
    page_title: document.title.slice(0, 500),
    referrer: document.referrer || null,
  });
  const telemetry = (url, method, payload) => {
    try {
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => null);
    } catch {
      return Promise.resolve(null);
    }
  };
  let requestKey = makeUuid();
  let sessionId = makeUuid();
  let formStartedAt = null;
  let telemetryTimer = null;
  const touchedFields = new Set();

  void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-story-assistive/placements", 'POST', placementContext());

  const sendSession = () => {
    if (!formStartedAt) return;
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = null;
    void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-story-assistive/sessions" + '/' + encodeURIComponent(sessionId), 'PUT', {
      ...sessionContext(),
      touched_fields: Array.from(touchedFields),
      utm: readTracking(),
      started_at: formStartedAt,
    });
  };
  const noteInteraction = (event) => {
    const key = event.target && event.target.name;
    if (!allowedFieldKeys.has(key)) return;
    touchedFields.add(key);
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = window.setTimeout(sendSession, 800);
  };
  ['focusin', 'input', 'change'].forEach((name) => form.addEventListener(name, noteInteraction));
  window.addEventListener('pagehide', sendSession);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    sendSession();
    const data = new FormData(form);
    const values = {};
    fields.forEach(({ key, kind }) => {
      values[key] = kind === 'checkbox' ? data.has(key) : String(data.get(key) || '');
    });
    const button = form.querySelector('button[type="submit"]');
    const result = form.querySelector('.ni-result');
    button.disabled = true;
    result.textContent = 'Отправляем…';
    try {
      const response = await fetch("https://erp.neuroiconica.ru/api/v1/public/forms/site-story-assistive/submissions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': requestKey,
        },
        body: JSON.stringify({
          fields: values,
          consent: data.has('consent'),
          honeypot: String(data.get('website') || ''),
          ...submissionContext(),
          utm: readTracking(),
          form_started_at: formStartedAt,
          session_id: sessionId,
        }),
      });
      if (!response.ok) throw new Error('submit failed');
      const payload = await response.json();
      form.reset();
      result.textContent = payload.message || "Спасибо за вашу историю! Мы ответим на указанный email в течение рабочего дня. Если письма нет, проверьте папку «Спам».";
      requestKey = makeUuid();
      sessionId = makeUuid();
      formStartedAt = null;
      touchedFields.clear();
    } catch {
      result.textContent = 'Не удалось отправить заявку. Позвоните нам или повторите попытку позже.';
    } finally {
      button.disabled = false;
    }
  });
})();
</script>
~~~~


## F7. Поделитесь исследованием, наука (site-share-research)

~~~~html
<div class="ni-crm-form" id="ni-crm-site-share-research">
  <form novalidate>
    <h3>Поделитесь исследованием</h3>
    <p>Расскажите о своём исследовании на нашем оборудовании, и мы предложим опубликовать кейс.</p>
    <label>Имя<input type="text" name="name" maxlength="500" placeholder="Как к вам обращаться" required></label>
    <label>Телефон<input type="tel" name="phone" maxlength="500" placeholder="+7 999 000-00-00"></label>
    <label>Email<input type="email" name="email" maxlength="500" placeholder="name@example.ru" required></label>
    <label>Тема исследования<textarea name="message" maxlength="500" placeholder="О чём исследование" required></textarea></label>
    <label>Организация<input type="text" name="organization" maxlength="500" placeholder="Название организации" required></label>
    <label>Оборудование<input type="text" name="equipment" maxlength="500" placeholder="Какое оборудование использовали"></label>
    <label>Ссылка на публикацию<input type="text" name="publication_link" maxlength="500" placeholder="Ссылка или DOI"></label>
    <label>Если письмо не дойдёт, как ещё с вами связаться?<select name="second_channel" required><option value="">Выберите…</option><option value="Звонок">Звонок</option><option value="Telegram">Telegram</option><option value="MAX">MAX</option></select></label>
    <label>Номер телефона или @ник<input type="text" name="second_channel_value" maxlength="500" placeholder="Для выбранного способа связи"></label>
    <label class="ni-check"><input type="checkbox" name="consent" required> Я согласен на обработку персональных данных. <a href="https://neuroiconica.ru/agreement/" target="_blank" rel="noopener">Подробнее</a></label>
    <input class="ni-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button type="submit">Отправить</button>
    <p class="ni-result" role="status" aria-live="polite"></p>
  </form>
</div>
<style>
#ni-crm-site-share-research form{display:grid;gap:14px;max-width:560px}
#ni-crm-site-share-research label{display:grid;gap:5px}
#ni-crm-site-share-research input,#ni-crm-site-share-research textarea,#ni-crm-site-share-research select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d8dce3;border-radius:6px}
#ni-crm-site-share-research .ni-check{display:flex;align-items:flex-start;gap:8px}
#ni-crm-site-share-research .ni-check input{width:auto;margin-top:4px}
#ni-crm-site-share-research button{padding:11px 18px;cursor:pointer}
#ni-crm-site-share-research .ni-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important}
</style>
<script>
(() => {
  const root = document.getElementById("ni-crm-site-share-research");
  const form = root && root.querySelector('form');
  if (!form || form.dataset.crmBound) return;
  form.dataset.crmBound = '1';
  const fields = [{"key":"name","kind":"text"},{"key":"phone","kind":"tel"},{"key":"email","kind":"email"},{"key":"message","kind":"textarea"},{"key":"organization","kind":"text"},{"key":"equipment","kind":"text"},{"key":"publication_link","kind":"text"},{"key":"second_channel","kind":"select"},{"key":"second_channel_value","kind":"text"}];
  const allowedFieldKeys = new Set(fields.map(({ key }) => key));
  const makeUuid = () => {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  };
  const readTracking = () => {
    const query = new URLSearchParams(window.location.search);
    const tracking = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','yclid'].forEach((key) => {
      if (query.get(key)) tracking[key] = query.get(key).slice(0, 300);
    });
    return tracking;
  };
  const placementContext = () => ({
    page_url: window.location.href,
    page_title: document.title.slice(0, 500),
    source: 'wordpress',
  });
  const sessionContext = () => ({
    ...placementContext(),
    referrer: document.referrer || null,
  });
  const submissionContext = () => ({
    source_url: window.location.href,
    page_title: document.title.slice(0, 500),
    referrer: document.referrer || null,
  });
  const telemetry = (url, method, payload) => {
    try {
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => null);
    } catch {
      return Promise.resolve(null);
    }
  };
  let requestKey = makeUuid();
  let sessionId = makeUuid();
  let formStartedAt = null;
  let telemetryTimer = null;
  const touchedFields = new Set();

  void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-share-research/placements", 'POST', placementContext());

  const sendSession = () => {
    if (!formStartedAt) return;
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = null;
    void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-share-research/sessions" + '/' + encodeURIComponent(sessionId), 'PUT', {
      ...sessionContext(),
      touched_fields: Array.from(touchedFields),
      utm: readTracking(),
      started_at: formStartedAt,
    });
  };
  const noteInteraction = (event) => {
    const key = event.target && event.target.name;
    if (!allowedFieldKeys.has(key)) return;
    touchedFields.add(key);
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = window.setTimeout(sendSession, 800);
  };
  ['focusin', 'input', 'change'].forEach((name) => form.addEventListener(name, noteInteraction));
  window.addEventListener('pagehide', sendSession);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    sendSession();
    const data = new FormData(form);
    const values = {};
    fields.forEach(({ key, kind }) => {
      values[key] = kind === 'checkbox' ? data.has(key) : String(data.get(key) || '');
    });
    const button = form.querySelector('button[type="submit"]');
    const result = form.querySelector('.ni-result');
    button.disabled = true;
    result.textContent = 'Отправляем…';
    try {
      const response = await fetch("https://erp.neuroiconica.ru/api/v1/public/forms/site-share-research/submissions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': requestKey,
        },
        body: JSON.stringify({
          fields: values,
          consent: data.has('consent'),
          honeypot: String(data.get('website') || ''),
          ...submissionContext(),
          utm: readTracking(),
          form_started_at: formStartedAt,
          session_id: sessionId,
        }),
      });
      if (!response.ok) throw new Error('submit failed');
      const payload = await response.json();
      form.reset();
      result.textContent = payload.message || "Спасибо! Мы ответим на указанный email в течение рабочего дня. Если письма нет, проверьте папку «Спам».";
      requestKey = makeUuid();
      sessionId = makeUuid();
      formStartedAt = null;
      touchedFields.clear();
    } catch {
      result.textContent = 'Не удалось отправить заявку. Позвоните нам или повторите попытку позже.';
    } finally {
      button.disabled = false;
    }
  });
})();
</script>
~~~~


## F8. Запросить демо, ассистив (site-demo-assistive)

~~~~html
<div class="ni-crm-form" id="ni-crm-site-demo-assistive">
  <form novalidate>
    <h3>Запросить демо</h3>
    <p>Расскажите о ситуации, и мы подберём решение и покажем, как это работает.</p>
    <label>Имя<input type="text" name="name" maxlength="500" placeholder="Как к вам обращаться" required></label>
    <label>Телефон<input type="tel" name="phone" maxlength="500" placeholder="+7 999 000-00-00"></label>
    <label>Email<input type="email" name="email" maxlength="500" placeholder="name@example.ru" required></label>
    <label>Сообщение<textarea name="message" maxlength="500" placeholder="Расскажите о ситуации"></textarea></label>
    <label>Для кого подбираете решение<select name="for_whom" required><option value="">Выберите…</option><option value="Для себя">Для себя</option><option value="Для близкого человека">Для близкого человека</option><option value="Для центра или учреждения">Для центра или учреждения</option></select></label>
    <label>Город<input type="text" name="city" maxlength="500" placeholder="Ваш город"></label>
    <label>Что вас интересует<select name="product"><option value="">Выберите…</option><option value="Стерх Домашний">Стерх Домашний</option><option value="Стерх Профессиональный">Стерх Профессиональный</option><option value="Пионер">Пионер</option><option value="Игры">Игры</option><option value="Пока не знаю">Пока не знаю</option></select></label>
    <label>Если письмо не дойдёт, как ещё с вами связаться?<select name="second_channel" required><option value="">Выберите…</option><option value="Звонок">Звонок</option><option value="Telegram">Telegram</option><option value="MAX">MAX</option></select></label>
    <label>Номер телефона или @ник<input type="text" name="second_channel_value" maxlength="500" placeholder=""></label>
    <label class="ni-check"><input type="checkbox" name="consent" required> Я согласен на обработку персональных данных. <a href="https://neuroiconica.ru/agreement/" target="_blank" rel="noopener">Подробнее</a></label>
    <input class="ni-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button type="submit">Отправить</button>
    <p class="ni-result" role="status" aria-live="polite"></p>
  </form>
</div>
<style>
#ni-crm-site-demo-assistive form{display:grid;gap:14px;max-width:560px}
#ni-crm-site-demo-assistive label{display:grid;gap:5px}
#ni-crm-site-demo-assistive input,#ni-crm-site-demo-assistive textarea,#ni-crm-site-demo-assistive select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d8dce3;border-radius:6px}
#ni-crm-site-demo-assistive .ni-check{display:flex;align-items:flex-start;gap:8px}
#ni-crm-site-demo-assistive .ni-check input{width:auto;margin-top:4px}
#ni-crm-site-demo-assistive button{padding:11px 18px;cursor:pointer}
#ni-crm-site-demo-assistive .ni-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important}
</style>
<script>
(() => {
  const root = document.getElementById("ni-crm-site-demo-assistive");
  const form = root && root.querySelector('form');
  if (!form || form.dataset.crmBound) return;
  form.dataset.crmBound = '1';
  const fields = [{"key":"name","kind":"text"},{"key":"phone","kind":"tel"},{"key":"email","kind":"email"},{"key":"message","kind":"textarea"},{"key":"for_whom","kind":"select"},{"key":"city","kind":"text"},{"key":"product","kind":"select"},{"key":"second_channel","kind":"select"},{"key":"second_channel_value","kind":"text"}];
  const allowedFieldKeys = new Set(fields.map(({ key }) => key));
  const makeUuid = () => {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  };
  const readTracking = () => {
    const query = new URLSearchParams(window.location.search);
    const tracking = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','yclid'].forEach((key) => {
      if (query.get(key)) tracking[key] = query.get(key).slice(0, 300);
    });
    return tracking;
  };
  const placementContext = () => ({
    page_url: window.location.href,
    page_title: document.title.slice(0, 500),
    source: 'wordpress',
  });
  const sessionContext = () => ({
    ...placementContext(),
    referrer: document.referrer || null,
  });
  const submissionContext = () => ({
    source_url: window.location.href,
    page_title: document.title.slice(0, 500),
    referrer: document.referrer || null,
  });
  const telemetry = (url, method, payload) => {
    try {
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => null);
    } catch {
      return Promise.resolve(null);
    }
  };
  let requestKey = makeUuid();
  let sessionId = makeUuid();
  let formStartedAt = null;
  let telemetryTimer = null;
  const touchedFields = new Set();

  void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-demo-assistive/placements", 'POST', placementContext());

  const sendSession = () => {
    if (!formStartedAt) return;
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = null;
    void telemetry("https://erp.neuroiconica.ru/api/v1/public/forms/site-demo-assistive/sessions" + '/' + encodeURIComponent(sessionId), 'PUT', {
      ...sessionContext(),
      touched_fields: Array.from(touchedFields),
      utm: readTracking(),
      started_at: formStartedAt,
    });
  };
  const noteInteraction = (event) => {
    const key = event.target && event.target.name;
    if (!allowedFieldKeys.has(key)) return;
    touchedFields.add(key);
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    if (telemetryTimer) window.clearTimeout(telemetryTimer);
    telemetryTimer = window.setTimeout(sendSession, 800);
  };
  ['focusin', 'input', 'change'].forEach((name) => form.addEventListener(name, noteInteraction));
  window.addEventListener('pagehide', sendSession);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!formStartedAt) formStartedAt = new Date().toISOString();
    sendSession();
    const data = new FormData(form);
    const values = {};
    fields.forEach(({ key, kind }) => {
      values[key] = kind === 'checkbox' ? data.has(key) : String(data.get(key) || '');
    });
    const button = form.querySelector('button[type="submit"]');
    const result = form.querySelector('.ni-result');
    button.disabled = true;
    result.textContent = 'Отправляем…';
    try {
      const response = await fetch("https://erp.neuroiconica.ru/api/v1/public/forms/site-demo-assistive/submissions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': requestKey,
        },
        body: JSON.stringify({
          fields: values,
          consent: data.has('consent'),
          honeypot: String(data.get('website') || ''),
          ...submissionContext(),
          utm: readTracking(),
          form_started_at: formStartedAt,
          session_id: sessionId,
        }),
      });
      if (!response.ok) throw new Error('submit failed');
      const payload = await response.json();
      form.reset();
      result.textContent = payload.message || "Спасибо! Мы ответим на указанный email в течение рабочего дня. Если письма нет, проверьте папку «Спам».";
      requestKey = makeUuid();
      sessionId = makeUuid();
      formStartedAt = null;
      touchedFields.clear();
    } catch {
      result.textContent = 'Не удалось отправить заявку. Позвоните нам или повторите попытку позже.';
    } finally {
      button.disabled = false;
    }
  });
})();
</script>
~~~~

