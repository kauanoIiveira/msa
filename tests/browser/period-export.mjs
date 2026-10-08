import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {createStaticServer} from '../../scripts/serve.mjs';
import {installAuthFixture} from './fixtures/auth.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright'),server=await createStaticServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})}),url=`http://127.0.0.1:${server.address().port}/`;
try{
 const page=await browser.newPage();await installAuthFixture(page,{role:'admin'});await page.goto(url);await page.locator('#login [name=re]').fill('00000');await page.locator('#login [name=password]').fill('fixture-only');await page.locator('#login [type=submit]').click();await page.locator('.rail').waitFor();
 await page.evaluate(async()=>{
  const {createLocalRepository}=await import('/src/ui/demo-workspace.js'),{createMsaServices}=await import('/src/services/create-msa.js');const stored=JSON.parse(localStorage.getItem('msa.demo.workspace.v1'));
  const local=createLocalRepository({data:stored.data,now:Date.now,persist:data=>localStorage.setItem('msa.demo.workspace.v1',JSON.stringify({...stored,data}))}),services=createMsaServices({repo:local.repo,actor:{uid:'fixture',role:'admin'}}),context=Object.values(stored.data.production)[0].context;
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date()),from=Date.parse(day+'T00:00:00-03:00');
  await services.operations.recordProduction({id:'test-carry-over',context,quantity:987654321,basis:'gross',startedAt:from-3600000,endedAt:from+3600000});
  await services.operations.recordProduction({id:'test-touch-boundary',context,quantity:987654320,basis:'gross',startedAt:from-7200000,endedAt:from});local.dispose();
 });
 await page.reload();await page.locator('.rail').waitFor();await page.goto(url+'#operations');await page.locator('#period').selectOption('1');await page.getByText('987.654.321 peças').waitFor();assert.equal(await page.getByText('987.654.320 peças').count(),0);
 const download=page.waitForEvent('download');await page.locator('[data-action=export]').click();await mkdir('output/nhpl-entrega-2026-10-07',{recursive:true});await(await download).saveAs('output/nhpl-entrega-2026-10-07/period.csv');const csv=await readFile('output/nhpl-entrega-2026-10-07/period.csv','utf8');assert.match(csv,/test-carry-over/);assert.doesNotMatch(csv,/test-touch-boundary|\[object Promise\]/);console.log('Carry-over production remains whole in table/CSV; boundary-only rows excluded.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
