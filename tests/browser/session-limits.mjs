import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createStaticServer} from '../../scripts/serve.mjs';
import {installAuthFixture} from './fixtures/auth.mjs';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const server=await createStaticServer({port:0});
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL??'msedge'});
const url=`http://127.0.0.1:${server.address().port}/`;
const selected=process.argv.find(arg=>arg.startsWith('--case='))?.slice(7)??'all';
const errors=[],results=[];
const output='output/revisao-2026-10-08';
await mkdir(output,{recursive:true});

async function pageFor(role='admin',wrapper=false){
  const context=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/fonts.googleapis.com/**',route=>route.abort());
  await page.route('**/fonts.gstatic.com/**',route=>route.abort());
  if(wrapper){
    await page.route('**/wrapper/index.html',async route=>route.fulfill({contentType:'text/html',body:await readFile('index.html','utf8')}));
    await page.route('**/wrapper/app/**',async route=>route.fulfill({response:await page.request.get(url+new URL(route.request().url()).pathname.split('/wrapper/app/')[1])}));
  }
  await installAuthFixture(page,{role});
  await page.goto(wrapper?url+'wrapper/index.html':url,{waitUntil:'networkidle'});
  return page;
}
async function login(page,re='00000'){
  // The limits regression also runs against the former anonymous entry.
  if(!await page.locator('#login').count()){
    await page.locator('.avatar').click();
    await page.getByRole('button',{name:'Entrar com RE',exact:true}).click();
  }
  await page.locator('#login [name=re]').fill(re);
  await page.locator('#login [name=password]').fill('fixture-only');
  await page.locator('#login [type=submit]').click();
  await page.locator('.rail').waitFor();
}
async function save(page){
  await page.locator('#modal [type=submit]').click();
  await page.waitForFunction(()=>!document.getElementById('modal').open);
}
async function limits(page){
  await page.goto(url+'#registry');
  await page.locator('[data-tab=parameters]').click();
  await page.locator('[data-action="version:ap-fit"]').click();
}
try{
  if(['all','session'].includes(selected)){
    const entry=await pageFor('admin',true);
    assert.equal(await entry.locator('#login').count(),1,'Repository index redirects to the login');
    assert.equal(new URL(entry.url()).pathname,'/wrapper/app/index.html');assert.equal(new URL(entry.url()).hash,'#login');
    await entry.context().close();results.push('repository index redirect to login');
    const page=await pageFor();
    assert.equal(await page.locator('#login').count(),1,'Opening the app requires login');
    assert.equal(await page.locator('.rail').count(),0,'No anonymous dashboard');
    assert.equal(await page.getByRole('button',{name:'Abrir simulação local'}).count(),0);
    await login(page);
    await page.reload({waitUntil:'networkidle'});
    await page.locator('.rail').waitFor();
    await page.goto(url+'#settings');
    await page.locator('.avatar').click();
    await page.getByRole('button',{name:'Sair',exact:true}).click();
    await page.locator('#login').waitFor();
    assert.equal(await page.locator('.rail').count(),0);
    assert.equal(new URL(page.url()).hash,'#login');
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('#login').count(),1,'Logout remains effective after reload');
    await page.goto(url+'#dashboard',{waitUntil:'networkidle'});
    assert.equal(await page.locator('#login').count(),1,'A typed route cannot bypass login');
    await page.screenshot({path:output+'/login.png',fullPage:true});
    results.push('login, session restoration, logout and protected routes');
    await page.context().close();
  }
  if(['all','limits'].includes(selected)){
    const page=await pageFor();await login(page);await limits(page);
    const before=await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('msa.nhpl.presentation.v3')).data.parameterVersions).find(v=>v.parameterId==='ap-fit'));
    await page.locator('#modal [name=lower]').fill('9,4');
    await page.locator('#modal [name=upper]').fill('10,6');
    await save(page);
    await page.reload({waitUntil:'networkidle'});await limits(page);
    assert.equal(await page.locator('#modal [name=lower]').inputValue(),'9.4','Reopening retains the latest saved draft');
    assert.equal(await page.locator('#modal [name=upper]').inputValue(),'10.6');
    assert.equal(await page.locator('#modal [name=status]').inputValue(),'draft');
    const versionCount=Object.keys(await page.evaluate(()=>JSON.parse(localStorage.getItem('msa.nhpl.presentation.v3')).data.parameterVersions)).length;
    await page.locator('#modal [name=lower]').fill('12');await page.locator('#modal [type=submit]').click();
    await page.waitForFunction(()=>document.querySelector('#modal .form-error').textContent.length>0);
    assert.equal(Object.keys(await page.evaluate(()=>JSON.parse(localStorage.getItem('msa.nhpl.presentation.v3')).data.parameterVersions)).length,versionCount,'Invalid ranges do not save a version');
    await page.locator('#modal [name=lower]').fill('9,3');
    await page.locator('#modal [name=upper]').fill('10,7');
    await page.locator('#modal [name=status]').selectOption('approved');await save(page);
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('msa.nhpl.presentation.v3')).data.parameterVersions);
    assert.deepEqual(saved[before.id],before,'The reference used by historical readings remains intact');
    const approved=Object.values(saved).find(v=>v.parameterId==='ap-fit'&&v.rule.lower===9.3);
    assert.equal(approved.status,'approved');
    await page.goto(url+'#parameters');await page.locator('[data-parameter="ap-fit"]').click();
    assert.match(await page.locator('#modal').innerText(),/Referência da leitura: 9,5 a 10,5 mm/);
    assert.match(await page.locator('#modal').innerText(),/Limite atual aprovado: 9,3 a 10,7 mm/);
    await page.locator('#modal [data-action=close-modal]').first().click();
    await page.goto(url+'#parameters');await page.locator('[data-action="form:collection"]').click();
    assert.equal(await page.locator('#modal [name=version_ap-fit]').inputValue(),approved.id,'New collections use the approved update');
    await page.locator('#modal [name=raw_ap-fit]').fill('10,65');await save(page);
    const collections=await page.evaluate(()=>JSON.parse(localStorage.getItem('msa.nhpl.presentation.v3')).data.collections);
    assert.ok(Object.values(collections).some(c=>c.readings?.['ap-fit']?.versionId===approved.id&&c.readings['ap-fit'].value===10.65));
    await limits(page);assert.equal(await page.locator('#modal [name=lower]').inputValue(),'9.3');
    await page.screenshot({path:output+'/limites-salvos.png',fullPage:true});
    results.push('draft persistence, explicit approval, new collections and immutable historical references');
    await page.context().close();
  }
  assert.deepEqual(errors,[]);
  await writeFile(output+'/session-limits.json',JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({results,errors},null,2));
}finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
