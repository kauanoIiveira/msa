import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createStaticServer} from '../../scripts/serve.mjs';
import {installAuthFixture} from './fixtures/auth.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const server=await createStaticServer({port:0});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
const results=[],errors=[];
await mkdir('output/acessos-2026-10-07',{recursive:true});
try {
  for(const [re,role] of [['00000','admin'],['00001','engineer'],['00002','operator'],['00003','viewer']]) {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    page.on('pageerror',error=>errors.push(error.message));
    await installAuthFixture(page,{role});
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.locator('#login [name=re]').fill(re);
    await page.locator('#login [name=password]').fill('fixture-only');
    await page.locator('#login [type=submit]').click();
    await page.locator('.zones .zone').first().waitFor();
    const editing=['admin','engineer'].includes(role),operating=role!=='viewer';
    assert.equal(await page.locator('[data-action="form:collection"]').count(),operating?1:0);
    const visit=async route=>{await page.locator(`.rail .rail-link[href="#${route}"]`).click();await page.locator('#page').waitFor();};
    const result={re,role,pages:[]};
    for(const route of ['dashboard','parameters','operations','engineering','cep','history','registry','settings']) {
      await visit(route);assert.equal(await page.locator('.error-band').count(),0);
      result.pages.push(await page.locator('.page-heading h1').innerText());
    }
    await visit('operations');
    for(const tab of ['production','stoppages','losses']) {
      await page.locator(`[data-tab=${tab}]`).click();
      assert.equal(await page.getByRole('button',{name:'Novo registro',exact:true}).count(),operating?1:0);
    }
    await visit('history');await page.locator('[data-tab=collections]').click();
    assert.equal(await page.locator('[data-action="csv-import"]').count(),operating?1:0);
    assert.equal((await page.locator('[data-action^="review:"]').count())>0,operating);
    await visit('engineering');
    assert.equal((await page.locator('[data-action^="start:"]').count())>0,editing);
    assert.equal((await page.locator('[data-action^="decide:"]').count())>0,editing);
    await visit('registry');
    for(const tab of ['machines','processes','products','parameters','reasons','targets']) {
      await page.locator(`[data-tab=${tab}]`).click();
      assert.equal(await page.getByRole('button',{name:'Novo cadastro',exact:true}).count(),(role==='admin'||tab==='targets'&&editing)?1:0);
      if(tab==='parameters')assert.equal((await page.locator('[data-action^="version:"]').count())>0,editing);
    }
    await page.screenshot({path:`output/acessos-2026-10-07/${re}-${role}-metas.png`,fullPage:true});
    results.push(result);await page.close();
  }
  // A RE alias never assigns a role: the workspace membership wins.
  const page=await browser.newPage();await installAuthFixture(page,{role:'viewer'});
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.locator('#login [name=re]').fill('00000');await page.locator('#login [name=password]').fill('fixture-only');
  await page.locator('#login [type=submit]').click();await page.locator('.zones .zone').first().waitFor();
  assert.equal(await page.locator('[data-action="form:collection"]').count(),0);
  await page.close();assert.deepEqual(errors,[]);
  await writeFile('output/acessos-2026-10-07/perfis-interface.json',JSON.stringify({fixtureOnly:true,results,errors},null,2));
  console.log('Four profiles: navigation, registration, operational entries, imports and decisions match their permissions; RE cannot grant a role (in-memory fixtures).');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
