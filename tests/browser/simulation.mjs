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
 for(const scenario of ['normal','outside','missing','invalid','constant','insufficient','stoppage','losses','target','pending','engineering']){
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
    await page.getByText(scenario==='constant'?'Leituras sem variação. Cp/Cpk indisponíveis; isso não comprova capacidade.':'Amostra insuficiente para estimar dispersão e capacidade.',{exact:true}).waitFor();
    await page.locator('[data-action=close-modal]').first().click();
  }
  if(scenario==='stoppage'){
   await page.locator('a[href="#operations"]').first().click();await page.locator('[data-tab=stoppages]').click();
   await page.locator('[data-action^="close:"]').first().click();
   await page.locator('#modal [type=submit]').click();await page.waitForFunction(()=>!document.getElementById('modal').open);
   assert.equal(await page.locator('[data-action^="close:"]').count(),0);
  }
  await page.locator('[data-action=end-simulation]').click();
  await page.locator('[data-action=connect]').first().waitFor();
  assert.equal(await page.locator('.simulation-notice').count(),0);
  await page.locator('a[href="#dashboard"]').first().click();
 }
 assert.equal(writes,0);assert.deepEqual(errors,[]);
 await page.locator('[data-action=simulate]').click();await page.locator('#modal [type=submit]').click();await page.waitForFunction(()=>!document.getElementById('modal').open);
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.waitForFunction(()=>document.querySelector('.rail').getBoundingClientRect().right<=0);
 await mkdir('output/ui',{recursive:true});await page.screenshot({path:'output/ui/simulation-mobile.png',fullPage:true,animations:'disabled'});
 console.log(JSON.stringify({ok:true,scenarios:11,firebaseWrites:writes,errors}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
