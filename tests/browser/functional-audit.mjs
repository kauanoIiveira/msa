import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createStaticServer} from '../../scripts/serve.mjs';
import {installAuthFixture} from './fixtures/auth.mjs';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const server=await createStaticServer({port:0});
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL??'msedge'});
const url=`http://127.0.0.1:${server.address().port}/`,output='output/revisao-2026-10-08';
const errors=[],results=[];
await mkdir(output,{recursive:true});
const seededWarning=/fict[ií]ci|did[aá]tic|hipot[eé]tic|demonstrativ|dados de apresenta[çc][ãa]o/i;
const data=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('msa.nhpl.presentation.v3')).data);
async function cleanLabels(page,place){
  const text=await page.locator('body').innerText();
  const fields=await page.locator('#modal[open] input:not([type=password]),#modal[open] textarea').evaluateAll(nodes=>nodes.map(node=>node.value).join('\n'));
  assert.equal((text+'\n'+fields).split('\n').find(line=>seededWarning.test(line)),undefined,`No presentation warnings in ${place}`);
  assert.equal(await page.locator('.error-band').count(),0,place);
}
async function go(page,route){await page.goto(url+'#'+route);await page.waitForFunction(()=>document.querySelector('.rail')&&!document.querySelector('.loading-line'));await cleanLabels(page,route);}
async function close(page){if(await page.locator('#modal[open]').count())await page.locator('#modal [data-action=close-modal]').first().click();}
async function save(page){
  assert.equal(await page.locator('#modal form').evaluate(form=>form.checkValidity()),true,'Required form fields');
  await page.locator('#modal [type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#modal .form-error')?.textContent||!document.getElementById('modal').open&&!document.querySelector('.loading-line'));
  assert.equal(await page.locator('#modal .form-error').innerText(),'','Saving the form');
}
async function download(page,action,filename){const pending=page.waitForEvent('download');await page.locator(`[data-action="${action}"]`).click();await(await pending).saveAs(output+'/'+filename);assert.ok((await readFile(output+'/'+filename)).length>20);}
try{
  for(const [re,role] of [['00000','admin'],['00001','engineer'],['00002','operator'],['00003','viewer']]){
    const context=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true}),page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/fonts.googleapis.com/**',route=>route.abort());await page.route('**/fonts.gstatic.com/**',route=>route.abort());
    await installAuthFixture(page,{role});await page.goto(url);
    await page.locator('#login [name=re]').fill(re);await page.locator('#login [name=password]').fill('fixture-only');await page.locator('#login [type=submit]').click();await page.locator('.rail').waitFor();
    const editing=['admin','engineer'].includes(role),operating=role!=='viewer';
    assert.equal(await page.locator('.rail a[href="#registry"]').count(),editing?1:0);
    assert.equal(await page.locator('.rail a[href="#engineering"]').count(),editing?1:0);
    for(const route of ['dashboard','parameters','operations','planning','engineering','cep','history','registry','settings','indicators','capture','tv'])await go(page,route);
    if(!editing){await go(page,'registry');assert.equal(await page.locator('[data-action^="registry-edit:"]').count(),0);assert.equal(await page.locator('[data-action^="version:"]').count(),0);}
    await go(page,'parameters');assert.equal(await page.locator('[data-action="form:collection"]').count(),operating?1:0);
    if(role==='admin'){
      await page.locator('[data-parameter="ap-fit"]').click();await cleanLabels(page,'parameter details');await close(page);
      await go(page,'history');await page.locator('[data-tab=collections]').click();await page.locator('[data-detail^="collections:"]').first().click();await cleanLabels(page,'collection details');
      await page.locator('[data-action^="request-correction:"]').click();await cleanLabels(page,'correction form');await close(page);
      await go(page,'engineering');await page.locator('[data-detail^="reviews:"]').first().click();await cleanLabels(page,'quality evidence');await close(page);
      await go(page,'registry');await page.locator('[data-tab=reasons]').click();await page.locator('[data-action="form:registry-reason"]').click();
      await page.locator('#modal [name=name]').fill('Motivo conferido');await page.locator('#modal [name=kind]').selectOption('reject');await save(page);
      let snapshot=await data(page),reason=Object.values(snapshot.reasons).find(r=>r.name==='Motivo conferido');assert.ok(reason);
      await page.locator(`[data-action="registry-edit:reasons:${reason.id}"]`).click();await page.locator('#modal [name=name]').fill('Motivo revisado');await save(page);
      await page.locator(`[data-action="active:reasons:${reason.id}"]`).click();await save(page);assert.equal((await data(page)).reasons[reason.id].active,false);
      await page.locator(`[data-action="active:reasons:${reason.id}"]`).click();await save(page);
      await go(page,'parameters');await page.locator('[data-action="form:collection"]').click();await page.locator('#modal [name=raw_ap-fit]').fill('10,02');await page.locator('#modal [name=raw_ap-test]').fill('100');await save(page);
      snapshot=await data(page);assert.ok(Object.values(snapshot.collections).some(r=>r.readings?.['ap-fit']?.value===10.02));
      await go(page,'operations');await page.locator('[data-tab=losses]').click();await page.locator('[data-action="form:loss"]').click();
      await page.locator('#modal [name=amount]').fill('3');await page.locator('#modal [name=reasonId]').selectOption(reason.id);await save(page);
      assert.ok(Object.values((await data(page)).losses).some(r=>r.reasonId===reason.id&&r.amount===3));
      await page.locator('[data-tab=stoppages]').click();await page.locator('[data-action="form:stoppage"]').click();await page.locator('#modal [name=reasonId]').selectOption('nhpl-stop');await page.locator('#modal [name=startedAt]').fill(new Date(Date.now()-10860000).toISOString().slice(0,19));await save(page);
      const stop=Object.values((await data(page)).stoppages).find(r=>r.endedAt==null);assert.ok(stop);
      await page.locator(`[data-action="close:${stop.id}"]`).click();await page.locator('#modal [name=goodValidated]').check();await save(page);assert.ok((await data(page)).stoppages[stop.id].endedAt>=stop.startedAt);
      await go(page,'history');await page.locator('[data-tab=collections]').click();await page.locator('[data-action="csv-import"]').click();
      await page.locator('#modal [name=csvText]').fill('date;parameter;raw;unit\n2026-10-08;ap-fit;10.03;mm');await page.locator('#modal [type=submit]').click();await page.locator('#csv-preview [name=confirmed]').waitFor();await cleanLabels(page,'CSV preview');
      await page.locator('#modal [name=confirmed]').check();await save(page);assert.ok(Object.values((await data(page)).collections).some(r=>r.origin==='import'&&r.readings?.['ap-fit']?.value===10.03));
      await page.locator('[data-action^="review:"]').first().click();await page.locator('#modal [name=scope]').fill('Conferência dos registros');await save(page);
      await go(page,'engineering');snapshot=await data(page);const review=Object.values(snapshot.reviews).find(r=>r.scope==='Conferência dos registros');assert.ok(review);
      await page.locator(`[data-action="start:${review.id}"]`).click();await page.locator(`[data-action="decide:${review.id}"]`).waitFor();await page.locator(`[data-action="decide:${review.id}"]`).click();await page.locator('#modal [name=decision]').selectOption('approved');await page.locator('#modal [name=justification]').fill('Registros conferidos');await save(page);assert.equal((await data(page)).reviews[review.id].state,'approved');
      await go(page,'cep');await download(page,'cep-export','estudo.csv');await go(page,'indicators');await download(page,'tech:export','indicadores.csv');
      await go(page,'settings');await download(page,'presentation-backup','backup.json');await page.reload();await page.locator('.rail').waitFor();assert.equal((await data(page)).reasons[reason.id].name,'Motivo revisado');
      await go(page,'planning');await page.locator('[data-action="nhpl:plan"]').click();
      const day=new Date(Date.now()-97200000).toISOString().slice(0,10);
      for(const [field,value]of Object.entries({order:'OP-CONFERENCIA',lot:'LOTE-CONFERENCIA',shift:'1',startedAt:day+'T12:00',endedAt:day+'T12:30',plannedPieces:'150'}))await page.locator(`#modal [name=${field}]`).fill(value);
      await page.locator('#modal [name=intervalMinutes]').selectOption('30');await page.locator('#modal [type=submit]').click();await page.locator('#plan-preview [name=confirmed]').waitFor();await page.locator('#plan-preview [name=confirmed]').check();await save(page);
      await go(page,'operations');await page.locator('[data-tab=hourly]').click();await page.locator('[data-action^="nhpl:production:"]').first().click();await page.locator('#modal [name=quantity]').fill('143');await save(page);
      await page.locator('[data-action^="nhpl:confirm:"]').first().click();await page.locator('#modal [name=confirmed]').check();await save(page);assert.match(await page.locator('#page').innerText(),/95,33%/);
      await go(page,'tv');await page.locator('[data-action=tv-back]').click();await page.waitForFunction(()=>location.hash==='#indicators');
      await page.setViewportSize({width:390,height:844});await go(page,'parameters');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:output+'/parametros-390.png',fullPage:true});
      results.push('registry create/edit/activate, collections, rejection, stoppage closure, CSV import, engineering decision, CEP/OEE exports, backup, approved plan, production confirmation and mobile');
    }
    await page.setViewportSize({width:1440,height:900});await go(page,'tv');await page.locator('[data-action=tv-back]').click();await page.waitForFunction(()=>location.hash==='#indicators');await page.locator('.avatar').click();await page.locator('[data-action=logout]').click();await page.locator('#login').waitFor();assert.equal(await page.locator('.rail').count(),0);assert.equal(await page.locator('body.tv-active').count(),0);
    results.push({role,permissions:true,pages:true,cleanLabels:true,logout:true});await context.close();
  }
  assert.deepEqual(errors,[]);await writeFile(output+'/functional-audit.json',JSON.stringify({fixtureOnly:true,results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
