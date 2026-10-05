import {createStaticServer} from '../../scripts/serve.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const results=[];
for(const base of ['/','/msa-test/']) {
  const server=await createStaticServer({port:0,base,testHarness:true});let browser;
  try {
    browser=await chromium.launch({headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}${base}__test__/harness.html`);
    await page.waitForFunction(()=>window.testResult,{timeout:60000});const result=await page.evaluate(()=>window.testResult);
    if(!result.ok||errors.length) throw new Error(JSON.stringify({base,result,errors}));results.push({base,...result});
  } finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
console.log(JSON.stringify(results,null,2));
