const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/dmitr/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', ...['about', 'assistiv', 'neurobureau', 'products'].flatMap(dir =>
  fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith('.html')).map(f => `${dir}/${f}`))]
  .filter(f => fs.readFileSync(path.join(root, f), 'utf8').includes('class="erp-form"'));
const base = 'http://127.0.0.1:4173/';
const representatives = {
  F1: 'about/contacts.html', F2: 'products/emscan.html', F3: 'neurobureau/cognitive.html',
  F4: 'neurobureau/training.html', F6: 'assistiv/cases.html', F7: 'neurobureau/cases.html', F8: 'assistiv/pioner.html'
};
const expectedProducts = {
  'products/stationary-eyetracker.html': 'Стационарный айтрекер',
  'products/fnirs.html': 'InfraMind II', 'products/eyetracker.html': 'aSee Glasses',
  'products/neurob-glasses.html': 'Айтрекинг-очки NeuroB', 'products/emscan.html': 'EmScan',
  'products/neurobureau.html': 'АПК Нейробюро', 'products/shielded-rooms.html': 'Экранированные камеры',
  'assistiv/pioner.html': 'Пионер', 'assistiv/games.html': 'Игры', 'assistiv/index.html': 'Пока не знаю',
  'neurobureau/cognitive.html': 'Нейробюро.Тренажёр', 'neurobureau/education.html': 'Нейробюро.Практикум',
  'neurobureau/ux.html': 'Нейробюро.Юзабилити', 'neurobureau/reading.html': 'Нейробюро.Чтение',
  'neurobureau/stimuli.html': 'Нейробюро.Стимулы'
};
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [], submissions = [];
    let status = 200, delay = 0;
    page.on('pageerror', error => errors.push(error.message));
    // No requests reach ERP, including its automatic placement/session telemetry.
    await page.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.hostname === 'erp.neuroiconica.ru') {
        if (url.pathname.endsWith('/submissions')) {
          submissions.push({ url: request.url(), data: request.postDataJSON(), headers: request.headers() });
          const responseStatus = status;
          if (delay) await new Promise(resolve => setTimeout(resolve, delay));
          return route.fulfill({ status: responseStatus, contentType: 'application/json', body: JSON.stringify({ message: responseStatus === 200 ? 'Тест: принято' : 'Denied' }) });
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      if (url.hostname !== '127.0.0.1' || /\.mp4$/i.test(url.pathname)) return route.abort();
      return route.continue();
    });
    const shots = path.join(process.env.TEMP, 'neiroiconica-erp');
    fs.mkdirSync(shots, { recursive: true });
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 950 });
      for (const file of pages) {
        await page.goto(base + file);
        await page.locator('[data-erp-ready="true"]').waitFor();
        assert.equal(await page.locator('.ni-crm-form form').count(), 1, file);
        assert.equal(await page.locator('.ni-crm-form [name="email"]').getAttribute('required'), '', file);
        assert.equal(await page.locator('.ni-crm-form [name="consent"]').isChecked(), false, file);
        assert.equal(await page.locator('.ni-crm-form [name="consent"]').getAttribute('required'), '', file);
        assert.equal(await page.locator('.ni-crm-form [name="second_channel"]').getAttribute('required'), file.includes('cognitive') || file.includes('education') || file.includes('/ux.') || file.includes('/reading.') || file.includes('/stimuli.') ? null : '', file);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), true, `${file} ${width} overflow`);
        if (expectedProducts[file]) assert.equal(await page.locator('.ni-crm-form [name="product"]').inputValue(), expectedProducts[file], file);
        assert.equal(await page.locator('.erp-fallback').count(), 1, file);
        if (Object.values(representatives).includes(file)) {
          await page.addStyleTag({ content: '.reveal {opacity:1!important;transform:none!important}' });
          // Hide the fixed nav only for tall element captures, not during layout checks.
          await page.addStyleTag({ content: 'nav {visibility:hidden!important}' });
          await page.locator('.erp-form').screenshot({ path: path.join(shots, file.replaceAll('/', '-') + '-' + width + '.png') });
        }
      }
    }
    for (const [id, file] of Object.entries(representatives)) {
      await page.goto(base + file + '?utm_source=erp-test&utm_campaign=local-check');
      const form = page.locator('.ni-crm-form form');
      const before = submissions.length;
      await form.locator('[type="submit"]').click();
      assert.equal(submissions.length, before, id + ' empty submission blocked');
      await form.evaluate(form => {
        for (const field of form.elements) {
          if (field.name === 'website' || field.type === 'submit') continue;
          if (field.type === 'checkbox') field.checked = true;
          else if (field.tagName === 'SELECT') { if (!field.value) field.selectedIndex = 1; }
          else field.value = field.name === 'email' ? 'erp-test@example.com' : 'ТЕСТ: локальная проверка';
        }
      });
      await form.locator('[name="email"]').fill('invalid');
      await form.locator('[type="submit"]').click();
      assert.equal(submissions.length, before, id + ' invalid email blocked');
      await form.locator('[name="email"]').fill('erp-test@example.com');
      await form.locator('[name="consent"]').uncheck();
      await form.locator('[type="submit"]').click();
      assert.equal(submissions.length, before, id + ' consent required');
      await form.locator('[name="consent"]').check();
      status = 403;
      await form.locator('[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('.ni-result').textContent.includes('не разрешена'));
      const first = submissions.at(-1);
      assert.equal(first.data.fields.email, 'erp-test@example.com');
      assert.equal(first.data.consent, true);
      assert.equal(first.data.honeypot, '');
      assert.equal(first.data.utm.utm_source, 'erp-test');
      assert.ok(first.data.source_url.includes(file));
      assert.ok(first.data.form_started_at && first.data.session_id);
      assert.ok(first.headers['idempotency-key']);
      assert.equal(await form.locator('[name="email"]').inputValue(), 'erp-test@example.com');
      status = 500;
      await form.locator('[type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('.ni-result').textContent.includes('Данные сохранены'));
      assert.equal(submissions.at(-1).headers['idempotency-key'], first.headers['idempotency-key']);
      status = 200; delay = 150;
      await form.evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
      await page.waitForFunction(() => document.querySelector('.ni-result').textContent === 'Тест: принято');
      delay = 0;
      assert.equal(submissions.length, before + 3, id + ' double submit prevented');
      assert.equal(await form.locator('[name="email"]').inputValue(), '');
      assert.equal(await form.locator('[name="consent"]').isChecked(), false);
      if (expectedProducts[file]) assert.equal(await form.locator('[name="product"]').inputValue(), expectedProducts[file]);
      console.log(id + ': validation, payload, 403/500, retry, success/reset and double-submit OK');
    }
    await page.goto(base + 'products/emscan.html');
    await page.locator('[data-request-product="EmScan для отелей"]').click();
    assert.equal(await page.locator('select[name="product"]').inputValue(), 'EmScan для отелей');
    await page.locator('[data-request-product="EmScan"]').click();
    assert.equal(await page.locator('select[name="product"]').inputValue(), 'EmScan');
    await page.goto(base + 'index.html');
    await page.locator('[data-request-product="Закупка"]').click();
    assert.equal(await page.locator('select[name="product"]').inputValue(), 'Закупка по 44-ФЗ / 223-ФЗ / ГОЗ');
    await page.locator('[data-request-product="Подбор решения"]').click();
    assert.equal(await page.locator('select[name="product"]').inputValue(), '');
    const nojs = await browser.newPage({ javaScriptEnabled: false });
    await nojs.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await nojs.goto(base + 'about/contacts.html');
    assert.ok((await nojs.locator('.erp-fallback').getAttribute('href')).startsWith('mailto:'));
    await nojs.close();
    const local = await browser.newPage();
    await local.route('**/*', route => route.request().url().startsWith('file:') ? route.continue() : route.abort());
    await local.goto(require('node:url').pathToFileURL(path.join(root, 'assistiv/pioner.html')).href);
    assert.equal(await local.locator('select[name="product"]').inputValue(), 'Пионер');
    await local.close();
    assert.deepEqual(errors, []);
    console.log(`PASS: ${pages.length} pages, desktop/mobile, seven mocked form workflows, no live ERP submissions. Screenshots: ${shots}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
