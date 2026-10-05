const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const { chromium }=require('C:/Users/dmitr/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const files=['index.html',...['about','assistiv','neurobureau','products'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(n=>n.endsWith('.html')).map(n=>dir+'/'+n))].filter(n=>n!=='neurobureau/emotions.html');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
 const page=await browser.newPage();
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='127.0.0.1'||/\.mp4$/i.test(u.pathname))return route.abort();return route.continue();});
 const failures=[],errors=[],menus=new Set();
 page.on('pageerror',e=>errors.push(e.message));
 const shots=path.join(process.env.TEMP,'neiroiconica-review');fs.mkdirSync(shots,{recursive:true});
 for(const width of [1440,375]) {
  await page.setViewportSize({width,height:950});
  for(const file of files){
   await page.goto('http://127.0.0.1:4173/'+file,{waitUntil:'domcontentloaded'});
   await page.addStyleTag({content:'.reveal,.reveal-stagger,.reveal-stagger > * {opacity:1 !important;transform:none !important;transition:none !important;animation:none !important}'});
   const result=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>innerWidth+2,
    offenders:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left<-2)&&!e.closest('nav,.trust-carousel,svg,.grid-bg,.data-stream');}).slice(0,8).map(e=>[e.tagName,e.className,Math.round(e.getBoundingClientRect().width)]),
    ids:[...document.querySelectorAll('[id]')].map(e=>e.id),
    refs:[...document.querySelectorAll('a[href],link[href],script[src],img[src],source[src],video[poster]')].map(e=>e.getAttribute('href')||e.getAttribute('src')||e.getAttribute('poster')),
    nav:[...document.querySelectorAll('nav a')].map(a=>[a.textContent.replace(/\s+/g,' ').trim(),new URL(a.href).pathname]),
    missingAlt:[...document.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')).length,
    h1:document.querySelectorAll('h1').length,
    description:document.querySelector('meta[name="description"]')?.content,
    lang:document.documentElement.lang,
    title:document.title,
    noindex:document.querySelector('meta[name="robots"]')?.content.includes('noindex')
   }));
   if(result.overflow)failures.push({file,width,type:'overflow',offenders:result.offenders});
   if(result.ids.length!==new Set(result.ids).size)failures.push({file,width,type:'duplicate IDs'});
   if(width===1440){
    menus.add(JSON.stringify(result.nav));
    for(const ref of result.refs){
     if(!ref||/^(https?:|mailto:|tel:|data:|javascript:)/i.test(ref))continue;
     if(ref.startsWith('#')){if(ref.length>1&&!result.ids.includes(decodeURIComponent(ref.slice(1))))failures.push({file,type:'anchor',ref});continue;}
     const dest=path.resolve(path.dirname(path.join(root,file)),decodeURIComponent(ref.split(/[?#]/)[0]));
     if(!fs.existsSync(dest))failures.push({file,type:'missing file',ref});
    }
    if(result.h1!==1&&!result.noindex)failures.push({file,type:'h1 count',count:result.h1});
    if(!result.noindex&&(!result.description||result.lang!=='ru'))failures.push({file,type:'metadata'});
    const source=fs.readFileSync(path.join(root,file),'utf8');
    if(/neiroiconica@yandex\.ru|cases@neurobureau\.ru|60[–-]500|60 до 500/.test(source))failures.push({file,type:'outdated contact or frequency'});
    if(/44-ФЗ|223-ФЗ|ГОЗ/.test(source)&&!['index.html','about/who-we-are.html'].includes(file))failures.push({file,type:'procurement on wrong page'});
    if(file.includes('manual')&&!result.noindex)failures.push({file,type:'manual must be noindex'});
    if(result.nav.some(([label,url])=>/manual/.test(url)))failures.push({file,type:'manual in navigation'});
   }
   if(['index.html','products/emscan.html','products/neurob-glasses.html','products/stationary-eyetracker.html','products/neurobureau.html','neurobureau/universe.html','neurobureau/education.html','assistiv/cases.html','about/who-we-are.html'].includes(file))await page.screenshot({path:path.join(shots,file.replaceAll('/','-')+'-'+width+'.png'),fullPage:true});
  }
 }
 console.log(JSON.stringify({pages:files.length,viewports:[1440,375],menus:menus.size,errors,failures,screenshots:shots},null,2));
 assert.equal(menus.size,1,'Navigation differs between pages');
 await page.goto('http://127.0.0.1:4173/products/eyetracker.html');
 assert.equal((await page.locator('h1').textContent()).trim(),'aSee Glasses');
 assert.equal(await page.locator('#erp-F2').getAttribute('data-product'),'aSee Glasses');
 await page.locator('h1').screenshot({path:path.join(shots,'asee-title-mobile.png')});
 await page.goto('http://127.0.0.1:4173/neurobureau/universe.html');
 assert.equal(await page.locator('.hub-stat-number[data-counter="3"]').count(),1);
 assert.match(await page.locator('.hub-stat').nth(1).textContent(),/продукта доступны/);
 assert.doesNotMatch(await page.locator('meta[name="description"]').getAttribute('content'),/модальност/);
 assert.equal(await page.locator('#products a.revision-card').count(),8);
 assert.deepEqual(await page.locator('#products .revision-grid').evaluateAll(grids=>grids.map(g=>g.children.length)),[3,2,3]);
 assert.equal((await page.locator('#products a[href="../neurobureau/cognitive.html"] h3').textContent()).trim(),'Нейробюро.Тренажёр');
 await page.goto('http://127.0.0.1:4173/neurobureau/cognitive.html');
 assert.equal((await page.locator('h1').textContent()).trim(),'Нейробюро.Тренажёр');
 assert.match(await page.title(),/^Нейробюро\.Тренажёр/);
 assert.equal(await page.locator('#erp-F3').getAttribute('data-product'),'Нейробюро.Тренажёр');
 assert.equal((await page.locator('nav .nav-flyout a[href$="/cognitive.html"] .dropdown-label').textContent()).trim(),'Нейробюро.Тренажёр');
 await page.goto('http://127.0.0.1:4173/products/neurobureau.html');
 const moduleStatus=await page.locator('#additional-modules .revision-card').evaluateAll(cards=>Object.fromEntries(cards.map(c=>[c.querySelector('h3').textContent,c.querySelector('.revision-status').textContent])));
 assert.equal(moduleStatus['Мимика и голос'],'Доступно');
 assert.equal(moduleStatus['ЭЭГ'],'В разработке · 2027');
 assert.equal(await page.locator('img[src*="neurobureau-platform"]').count(),0);
 assert.doesNotMatch(await page.locator('#visualizations').textContent(),/матриц.*переход/i);
 assert.doesNotMatch(await page.locator('body').textContent(),/Shimmer/);
 console.log('Specification content checks OK');
 await page.goto('http://127.0.0.1:4173/neurobureau/cases.html');
 await page.selectOption('[data-filter="product"]','EmScan');
 console.log('EmScan filter:',await page.locator('[data-case]:visible').count());
 assert.equal(await page.locator('[data-case]:visible').count(),1);
 await page.selectOption('[data-filter="area"]','Психолингвистика');
 console.log('Empty filter:',await page.locator('[data-case-empty]').isVisible());
 assert.equal(await page.locator('[data-case-empty]').isVisible(),true);
 await page.click('[type="reset"]');console.log('Reset cases:',await page.locator('[data-case]:visible').count());
 assert.equal(await page.locator('[data-case]:visible').count(),13);
 await page.goto('http://127.0.0.1:4173/assistiv/cases.html');
 await page.locator('[data-video-tab="alisa-interview"]').click();
 console.log('Interview tab:',await page.locator('#alisa-interview').isVisible(),await page.locator('#alisa-case').isHidden());
 assert.equal(await page.locator('#alisa-interview').isVisible(),true);
 assert.equal(await page.locator('#alisa-case').isHidden(),true);
 await page.locator('[data-video-tab="alisa-interview"]').press('ArrowRight');
 assert.equal(await page.locator('#alisa-mom').isVisible(),true);
 await page.goto('http://127.0.0.1:4173/products/emscan.html');
 await page.locator('[data-request-product="EmScan для отелей"]').click();
 console.log('ERP product:',await page.locator('.erp-context').textContent());
 assert.match(await page.locator('.erp-context').textContent(),/EmScan для отелей/);
 await page.goto('http://127.0.0.1:4173/index.html');
 await page.locator('.nav-burger').click();
 assert.equal(await page.locator('.nav-menu').evaluate(el=>el.classList.contains('open')),true);
 await page.locator('.nav-item .nav-link').first().click();
 assert.equal(await page.locator('nav a[href="products/emscan.html"]').first().isVisible(),true);
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('.nav-menu').evaluate(el=>el.classList.contains('open')),false);
 await page.goto('http://127.0.0.1:4173/neurobureau/emotions.html');await page.waitForURL('**/products/emscan.html');console.log('Redirect OK');
 if(failures.length||errors.length)process.exitCode=1;
 } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
