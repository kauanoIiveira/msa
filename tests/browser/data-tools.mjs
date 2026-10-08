import assert from 'node:assert/strict';
import {createStaticServer} from '../../scripts/serve.mjs';
import {installAuthFixture} from './fixtures/auth.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const server=await createStaticServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})}),url=`http://127.0.0.1:${server.address().port}/`;
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('msa.demo.workspace.v1')).data);
async function login(page,options){await installAuthFixture(page,options);await page.goto(url);await page.locator('#login [name=re]').fill('00000');await page.locator('#login [name=password]').fill('fixture-only');await page.locator('#login [type=submit]').click();await page.locator('.dataset-bar').waitFor();}
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await login(page);
 await page.locator('.rail a[href="#history"]').click();await page.locator('[data-action=csv-import]').click();
 const source=await saved(page),parameter=Object.values(source.parameters).find(p=>p.code==='MSA_BF'),date=await page.evaluate(()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date()));
 const csv=`date;parameter;raw;unit\n${date};${parameter.id};0,85;${Object.values(source.parameterVersions).find(v=>v.parameterId===parameter.id&&v.status==='approved').unit}`;
 await page.locator('#csv-file').setInputFiles({name:'bench.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});
 await page.locator('#modal [type=submit]').click();await page.locator('#csv-preview [name=confirmed]').waitFor();
 assert.equal(Object.keys((await saved(page)).collections).length,Object.keys(source.collections).length,'Prévia não grava');
 assert.match(await page.locator('#csv-preview').innerText(),/0,85/);
 await page.locator('#modal [name=confirmed]').check();await page.locator('#modal [type=submit]').click();await page.waitForFunction(()=>!document.getElementById('modal').open);
 let after=await saved(page),imported=Object.values(after.collections).find(c=>c.origin==='import'&&c.source.file==='bench.csv');assert.ok(imported);assert.equal(imported.timePrecision,'date');
 await page.locator('[data-action=csv-import]').click();await page.locator('#modal [name=csvText]').fill(csv);await page.locator('#modal [name=sourceFile]').fill('bench.csv');
 await page.locator('#modal [type=submit]').click();await page.locator('#modal [name=confirmed]').check();await page.locator('#modal [type=submit]').click();await page.waitForFunction(()=>!document.getElementById('modal').open);
 assert.equal(Object.keys((await saved(page)).collections).length,Object.keys(after.collections).length,'Reimportação idempotente');
 await page.locator(`[data-detail="collections:${imported.id}"]`).click();await page.locator('[data-action^="request-correction:"]').click();
 await page.locator(`#modal [name="raw_${parameter.id}"]`).fill('');await page.locator('#modal [name=reason]').fill('Medição não realizada; manter ausência com justificativa.');await page.locator('#modal [type=submit]').click();await page.waitForFunction(()=>!document.getElementById('modal').open);
 after=await saved(page);assert.equal(after.collections[imported.id].readings[parameter.id].raw,'0,85','Original preservado');
 const correction=Object.values(after.corrections).find(c=>c.recordId===imported.id);assert.equal(correction.replacement.readings[0].status,'missing');assert.equal(correction.state,'waiting');
 await page.locator('.rail a[href="#engineering"]').click();await page.locator('[data-tab=corrections]').click();assert.equal(await page.locator(`[data-action="correction:${correction.id}"]`).count(),0);assert.match(await page.locator('#page').innerText(),/autor não pode aprovar/);
 await page.locator('.rail a[href="#operations"]').click();await page.locator('[data-tab=stoppages]').click();await page.locator('[data-action="form:stoppage"]').click();
 assert.equal(await page.locator('#modal [name=startedAt]').getAttribute('step'),'1');
 await page.locator('#modal [name=reasonId]').selectOption(Object.values((await saved(page)).reasons).find(r=>r.active&&r.kind==='stop').id);
 const beginning=await page.evaluate(()=>new Date(Date.now()-3*3600000-60000).toISOString().slice(0,19));await page.locator('#modal [name=startedAt]').fill(beginning);await page.locator('#modal [type=submit]').click();await page.waitForFunction(()=>!document.getElementById('modal').open);
 const stop=Object.values((await saved(page)).stoppages).find(s=>s.endedAt==null);assert.ok(stop);
 await page.locator(`[data-action="close:${stop.id}"]`).click();const end=new Date(Date.parse(beginning+'Z')+30000).toISOString().slice(0,19);await page.locator('#modal [name=endedAt]').fill(end);await page.locator('#modal [type=submit]').click();await page.waitForFunction(()=>!document.getElementById('modal').open);
 const closed=(await saved(page)).stoppages[stop.id];assert.equal(closed.endedAt-closed.startedAt,30000);
 const presentation=await browser.newPage();presentation.on('pageerror',e=>errors.push(e.message));await login(presentation,{synthetic:true});
 await presentation.locator('.rail a[href="#history"]').click();assert.equal(await presentation.locator('[data-detail^="collections:"]').count(),0);const before=await saved(presentation);
 await presentation.locator('#dataset-choice').selectOption('presentation');await presentation.locator('[data-detail^="collections:"]').first().waitFor();assert.equal(await presentation.locator('[data-action=csv-import]').count(),0);assert.equal(await presentation.locator('[data-action="form:collection"]').count(),0);
 assert.deepEqual(await saved(presentation),before,'Consulta de apresentação preserva a base');assert.deepEqual(errors,[]);
 console.log(JSON.stringify({ok:true,csvPreview:true,idempotent:true,originalPreserved:true,selfApprovalBlocked:true,seconds:30,datasetsSeparated:true,errors}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
