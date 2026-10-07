import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createStaticServer} from '../../scripts/serve.mjs';
import {installAuthFixture} from './fixtures/auth.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const server=await createStaticServer({port:0}),browser=await chromium.launch({headless:true});
const url=`http://127.0.0.1:${server.address().port}/`,out=process.env.MSA_VISUAL_OUTPUT??'output/repaginacao',errors=[],consoleErrors=[],checks=[],contrasts=[];
await mkdir(out,{recursive:true});
async function capture(page,filename) {
  await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);document.getElementById('toast')?.classList.remove('show');});
  await page.screenshot({path:filename,fullPage:true,animations:'disabled'});
}
try {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
  let writes=0;
  page.on('request',request=>{if(/firebaseio\.com|firebasedatabase\.app/.test(request.url())&&['POST','PUT','PATCH','DELETE'].includes(request.method()))writes++;});
  // No interception here: the login and simulator use the shipped entry point.
  await page.goto(url);
  await page.locator('#login').waitFor();
  await page.locator('[data-action=simulate]').click();
  await page.locator('#modal [type=submit]').click();
  await page.locator('.simulation-notice').waitFor();
  // Initial repository subscriptions schedule a 400 ms refresh; consult the rendered chart after it settles.
  await page.evaluate(()=>new Promise(resolve=>{
    let timer;
    const settled=()=>{clearTimeout(timer);timer=setTimeout(()=>{observer.disconnect();resolve();},500);};
    const observer=new MutationObserver(settled);
    observer.observe(document.getElementById('app'),{childList:true,subtree:true});settled();
  }));
  assert.equal(await page.locator('.chart-legend button').count(),2);
  const original=await page.locator('#production-chart').evaluate(canvas=>Chart.getChart(canvas).data.datasets.map(s=>s.data));
  assert.ok(await page.locator('#production-chart').evaluate(canvas=>Chart.getChart(canvas).scales.x.ticks.every(tick=>/\d{2}\/\d{2}/.test(tick.label))),'O eixo de produção exibe datas, sem índices numéricos');
  const legend=page.locator('.chart-legend button').first();
  await legend.focus();await legend.press('Enter');
  assert.equal(await legend.getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#production-chart').evaluate(canvas=>Chart.getChart(canvas).isDatasetVisible(0)),false);
  await legend.press('Enter');
  await page.locator('#production-chart').focus();
  await page.locator('#production-chart').press('ArrowRight');
  assert.match(await page.locator('#production-chart-readout').innerText(),/Produção bruta.*peças/);
  await page.locator('#production-chart-data summary').click();
  assert.equal(await page.locator('#production-chart-data tbody tr').count(),original[0].length);
  assert.deepEqual(await page.locator('#production-chart').evaluate(canvas=>Chart.getChart(canvas).data.datasets.map(s=>s.data)),original);
  await page.locator('#production-chart-data summary').click();
  await page.getByRole('button',{name:'Vacuo',exact:true}).click();
  assert.ok(await page.locator('#parameter-chart').evaluate(canvas=>Chart.getChart(canvas).data.datasets[0].data.some(v=>v<0)));
  assert.equal(await page.locator('#parameter-chart').evaluate(canvas=>Chart.getChart(canvas).options.elements.line.tension),0);
  await page.locator('#parameter-chart-data summary').click();
  await page.locator('#modal').screenshot({path:`${out}/parameter-negative-history.png`});
  await page.locator('[data-action=close-modal]').first().click();
  await page.locator('#production-chart').dispatchEvent('touchstart',{touches:[]});
  for(const theme of ['light','dark']) {
    await page.locator('a[href="#settings"]').first().click();
    await page.locator(`[data-theme-choice=${theme}]`).click();
    await page.locator('a[href="#dashboard"]').first().click();
    await page.locator('.metric').first().waitFor();
    const contrast=await page.evaluate(()=>{
      const styles=getComputedStyle(document.documentElement),c=name=>styles.getPropertyValue(name).trim();
      const luminance=color=>{let hex=color.replace('#','');if(hex.length===3)hex=hex.split('').map(v=>v+v).join('');const rgb=hex.match(/.{2}/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
      const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
      return Object.fromEntries([['texto',c('--ink'),c('--surface')],['secundário',c('--muted'),c('--surface')],['ação',c('--primary-ink'),c('--accent')],['sucesso',c('--green'),c('--green-bg')],['alerta',c('--amber'),c('--amber-bg')],['erro',c('--red'),c('--red-bg')]].map(([name,a,b])=>[name,Number(ratio(a,b).toFixed(2))]));
    });
    for(const [name,ratio] of Object.entries(contrast))assert.ok(ratio>=4.5,`Contraste ${theme} ${name}: ${ratio}`);
    contrasts.push({theme,...contrast});
    const surfaces=await page.locator('.metric').evaluateAll(cards=>cards.map(card=>getComputedStyle(card).backgroundColor));
    assert.ok(surfaces.every(color=>color===surfaces[0]),'Todos os cards de indicadores usam a mesma superfície');
    if(theme==='light') assert.equal(surfaces[0],'rgb(255, 255, 255)');
    if(theme==='dark') assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(18, 20, 22)');
    for(const width of [1366,1440,768,390]) {
      await page.setViewportSize({width,height:900});
      await capture(page,`${out}/dashboard-${theme}-${width}.png`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${theme} ${width}`);
      assert.equal(await page.locator('.zone').count(),21);
      checks.push(`dashboard ${theme} ${width}: sem overflow, 21 zonas`);
    }
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:900});
      await page.locator('.avatar').click();
      const position=await page.locator('#account-popover').evaluate(el=>{const r=el.getBoundingClientRect(),t=document.querySelector('.avatar').getBoundingClientRect();return {below:r.top>=t.bottom,inside:r.left>=0&&r.right<=innerWidth};});
      assert.deepEqual(position,{below:true,inside:true});
      await capture(page,`${out}/profile-${theme}-${width}.png`);
      await page.keyboard.press('Escape');
    }
    checks.push(`Perfil ${theme}: card sob o ícone, desktop e celular; indicadores com superfície uniforme`);
    await page.setViewportSize({width:1440,height:900});
    for(const route of ['parameters','operations','engineering','history','registry','settings']) {
      await page.goto(url+'#'+route);await page.locator('.page-heading h1').waitFor();
      await capture(page,`${out}/${route}-${theme}.png`);
      await page.setViewportSize({width:390,height:844});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${route} ${theme} mobile`);
      await capture(page,`${out}/${route}-${theme}-390.png`);
      await page.setViewportSize({width:1440,height:900});
      checks.push(`${route} ${theme}: desktop e celular`);
    }
    await page.goto(url+'#operations');
    await page.locator('[data-action="form:production"]').click();
    await page.locator('#modal').screenshot({path:`${out}/production-form-${theme}.png`});
    await page.setViewportSize({width:390,height:844});
    await page.locator('#modal').screenshot({path:`${out}/production-form-${theme}-390.png`});
    assert.ok(await page.locator('#modal').evaluate(modal=>modal.scrollWidth<=modal.clientWidth));
    await page.locator('[data-action=close-modal]').first().click();
    await page.setViewportSize({width:1440,height:900});
  }
  await page.goto(url+'#dashboard');
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-action=menu]').click();
  assert.equal(await page.locator('.rail').evaluate(el=>el.getBoundingClientRect().width),64);
  await page.locator('.rail a[href="#parameters"]').click();
  await page.waitForFunction(()=>document.querySelector('.rail').getBoundingClientRect().right<=0);
  await page.goto(url+'#registry');
  await page.locator('[data-action="form:registry-machine"]').click();
  await page.locator('#modal [name=name]').fill('Máquina de termoformagem com identificação extensa para consulta da Engenharia e produção');
  await page.locator('#modal [type=submit]').click();
  await page.waitForFunction(()=>!document.getElementById('modal').open);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await capture(page,`${out}/registry-long-name-390.png`);
  await page.goto(url+'#dashboard');
  await page.locator('[data-action=end-simulation]').click();await page.locator('#login').waitFor();
  for(const theme of ['light','dark']) {
    await page.locator(`[data-theme-choice=${theme}]`).click();
    for(const width of [1366,1440,768,390]) {
      await page.setViewportSize({width,height:900});
      await capture(page,`${out}/login-${theme}-${width}.png`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`login ${theme} ${width}`);
      assert.ok(await page.locator('.login-logo').evaluate(img=>img.complete&&img.naturalWidth===540));
      checks.push(`login ${theme} ${width}`);
    }
  }
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
  await page.locator('[data-theme-choice=system]').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.reload();await page.locator('#login').waitFor();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.emulateMedia({colorScheme:'light'});
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  assert.equal(await page.locator('#login [type=submit]').evaluate(button=>getComputedStyle(button).transitionDuration),'0s');
  checks.push('Tema Sistema persistido acompanha preferência do navegador; redução de movimento');
  const empty=await browser.newPage({viewport:{width:1440,height:900}});
  await installAuthFixture(empty,{empty:true});
  await empty.addInitScript(()=>sessionStorage.setItem('msa.test.auth','true'));
  await empty.goto(url);await empty.locator('.zone').first().waitFor();
  assert.equal(await empty.locator('.metric .missing-value').count(),4);
  await empty.screenshot({path:`${out}/operational-empty.png`,fullPage:true});
  await empty.close();
  assert.equal(writes,0);assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);
  const report={ok:true,checks,contrasts,errors,consoleErrors,firebaseWrites:writes,emptySource:'operational emptyDashboard with an in-memory authenticated viewer fixture',dataSource:'Shipped, explicitly labelled local simulator'};
  await writeFile(`${out}/visual-checks.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
