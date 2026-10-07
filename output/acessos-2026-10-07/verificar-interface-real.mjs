// Read-only UI verification and reproduction of audit findings. No forms are saved.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
if(!process.env.MSA_TEST_PASSWORD)throw Error('MSA_TEST_PASSWORD required; never store it in this file');
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL??'chrome'});
const errors=[],report={realFirebase:true,operationalWrites:false};
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/');
 await page.locator('#login [name=re]').fill('00000');
 await page.locator('#login [name=password]').fill(process.env.MSA_TEST_PASSWORD);
 await page.locator('#login [type=submit]').click();
 await page.locator('.rail').waitFor({timeout:60000});
 await page.waitForFunction(()=>!document.querySelector('.loading-line'),{timeout:60000});
 assert.equal(await page.locator('.error-band').count(),0);
 const visit=async route=>{await page.locator(`.rail .rail-link[href="#${route}"]`).click();await page.locator('#page').waitFor();};
 report.pages=[];
 for(const route of ['dashboard','parameters','operations','engineering','cep','history','registry','settings']){
  await visit(route);assert.equal(await page.locator('.error-band').count(),0);
  report.pages.push(await page.locator('.page-heading h1').innerText());
 }
 await page.reload();await page.locator('.rail').waitFor({timeout:60000});
 report.sessionRestored=true;
 await visit('dashboard');await page.locator('#dataset-choice').selectOption('presentation');
 await page.waitForFunction(()=>!document.querySelector('.loading-line'));
 await page.locator('#period').selectOption('custom');
 await page.locator('#modal [name=from]').fill('2026-10-01');await page.locator('#modal [name=to]').fill('2026-10-07');
 await page.locator('#modal [type=submit]').click();await page.waitForFunction(()=>!document.querySelector('#modal').open);
 await page.waitForFunction(()=>!document.querySelector('.loading-line'));
 await visit('operations');
 report.productionTable={selectedPeriod:['2026-10-01','2026-10-07'],rows:await page.locator('#page .data-table tbody tr').count(),firstRow:await page.locator('#page .data-table tbody tr').first().innerText()};
 await page.screenshot({path:'output/acessos-2026-10-07/periodo-producao-real.png',fullPage:true});
 await visit('cep');await page.locator('[data-cep=source]').selectOption('workbook');
 const downloadPromise=page.waitForEvent('download');await page.locator('[data-action=cep-export]').click();
 const download=await downloadPromise,content=await readFile(await download.path(),'utf8');
 report.cepExport={filename:download.suggestedFilename(),content,containsPromise:content==='[object Promise]'};
 await writeFile('output/acessos-2026-10-07/cep-export-evidence.txt',content);
 await visit('registry');await page.locator('#dataset-choice').selectOption('operational');
 await page.waitForFunction(()=>!document.querySelector('.loading-line'));
 await page.locator('[data-tab=targets]').click();
 report.targetInterface={rows:await page.locator('#page .data-table tbody tr').count(),actions:await page.locator('#page [data-action]').evaluateAll(nodes=>nodes.map(node=>({label:node.textContent.trim()||node.getAttribute('aria-label'),action:node.dataset.action})))};
 await page.screenshot({path:'output/acessos-2026-10-07/metas-conta-real.png',fullPage:true});
 await page.locator('[data-action="form:target"]').click();
 report.targetFormFields=await page.locator('#modal [name]').evaluateAll(nodes=>nodes.map(node=>node.name));
 await page.locator('[data-action=close-modal]').first().click();
 await page.locator('.avatar').click();await page.locator('[data-action=logout]').click();await page.locator('#login').waitFor();
 await page.reload();await page.locator('#login').waitFor();report.logout=true;
 assert.deepEqual(errors,[]);report.pageErrors=errors;
 await writeFile('output/acessos-2026-10-07/interface-real.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
} finally {await browser.close();}
