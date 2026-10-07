import assert from 'node:assert/strict';
import {createStaticServer} from '../../scripts/serve.mjs';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const server=await createStaticServer({port:0}),browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 let writes=0;page.on('request',r=>{if(/firebaseio\.com|firebasedatabase\.app/.test(r.url())&&['PUT','PATCH','POST','DELETE'].includes(r.method()))writes++;});
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 for(const scenario of ['normal','outside','missing','invalid','constant','insufficient','stoppage','losses','target','pending','engineering','cep-stable','cep-unstable']){
  await page.locator('[data-action=simulate]').click();
  await page.locator('#modal [name=scenario]').selectOption(scenario);
  await page.locator('#modal [type=submit]').click();
  await page.waitForFunction(()=>!document.getElementById('modal').open);
  await page.locator('.simulation-notice').waitFor();
  assert.equal(await page.locator('.zones .zone').count(),21);
  assert.equal(await page.locator('.process-parameters tbody tr').count(),20);
  if(scenario==='outside')assert.ok((await page.locator('.process-parameters').innerText()).includes('Fora da faixa'));
  if(scenario==='target')await page.getByText('Metas fora do esperado',{exact:true}).waitFor();
  if(scenario==='constant'||scenario==='insufficient'){
    await page.getByRole('button',{name:'Medida do Passo',exact:true}).click();
    await page.getByText(scenario==='constant'?'Dispersão zero. Os índices estão indisponíveis; confira resolução e aquisição.':'Amostra abaixo do mínimo definido para este estudo ou sem pares consecutivos suficientes.',{exact:true}).waitFor();
    await page.locator('[data-action=close-modal]').first().click();
  }
  if(scenario==='missing'||scenario==='invalid'){
   await page.getByRole('button',{name:'Medida do Passo',exact:true}).click();
   assert.equal(await page.locator('#parameter-chart').evaluate(canvas=>Chart.getChart(canvas).data.datasets[0].data.at(-1)),null);
   assert.equal(await page.locator('#parameter-chart').evaluate(canvas=>Chart.getChart(canvas).data.datasets[0].spanGaps),false);
   await page.locator('[data-action=close-modal]').first().click();
  }
  if(scenario==='stoppage'){
   await page.locator('a[href="#operations"]').first().click();await page.locator('[data-tab=stoppages]').click();
   await page.locator('[data-action^="close:"]').first().click();
   await page.locator('#modal [type=submit]').click();await page.waitForFunction(()=>!document.getElementById('modal').open);
   assert.equal(await page.locator('[data-action^="close:"]').count(),0);
  }
  if(scenario.startsWith('cep-')){
   await page.locator('.rail a[href="#cep"]').click();await page.locator('#cep-chart').waitFor();
   assert.match(await page.locator('#cep-results').innerText(),/60 leituras válidas/);
   if(scenario==='cep-stable')assert.notEqual(await page.locator('[data-cep-index=cp]').innerText(),'Sem dados');
   else {assert.equal(await page.locator('[data-cep-index=cp]').innerText(),'Sem dados');assert.match(await page.locator('#cep-results').innerText(),/Há sinais de instabilidade/);}
  }
  await page.locator('[data-action=end-simulation]').click();
  await page.locator('#login').waitFor();
  assert.equal(await page.locator('.simulation-notice').count(),0);

 }
 assert.equal(writes,0);assert.deepEqual(errors,[]);
 await page.locator('[data-action=simulate]').click();await page.locator('#modal [type=submit]').click();await page.waitForFunction(()=>!document.getElementById('modal').open);
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.waitForFunction(()=>document.querySelector('.rail').getBoundingClientRect().right<=0);
 await mkdir('output/ui',{recursive:true});await page.screenshot({path:'output/ui/simulation-mobile.png',fullPage:true,animations:'disabled'});
 console.log(JSON.stringify({ok:true,scenarios:13,firebaseWrites:writes,errors}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
