import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {createStaticServer} from '../../scripts/serve.mjs';
import {installAuthFixture} from './fixtures/auth.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const server=await createStaticServer({port:0,base:'/msa/'});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
const url=`http://127.0.0.1:${server.address().port}/msa/`,errors=[];
await mkdir('output/login-2026-10-07',{recursive:true});
try {
  for(const theme of ['light','dark'])for(const [width,height] of [[1440,900],[768,1024],[390,844],[812,375]]) {
    const page=await browser.newPage({viewport:{width,height}});
    page.on('pageerror',error=>errors.push(error.message));
    await installAuthFixture(page,{empty:true});
    await page.addInitScript(theme=>localStorage.setItem('msa.ui.preferences.v1',JSON.stringify({theme,vlibras:false})),theme);
    await page.goto(url);
    await page.locator('#login').waitFor();
    await page.locator('.login-photo').evaluate(image=>image.decode());
    await page.locator('.login-logo').evaluate(image=>image.decode());
    assert.equal(await page.locator('.login-brand p,.login-brand h2,.login-brand svg').count(),0);
    assert.equal(await page.locator('[data-theme-choice]').count(),0);
    assert.equal(await page.getByRole('img',{name:'MSA The Safety Company'}).count(),1);
    const layout=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      photo:document.querySelector('.login-photo').getBoundingClientRect().toJSON(),
      form:document.querySelector('#login').getBoundingClientRect().toJSON(),
      brand:document.querySelector('.login-logo').getBoundingClientRect().toJSON(),
    }));
    assert.equal(layout.overflow,false,`${theme}/${width}: no horizontal overflow`);
    assert.ok(layout.brand.bottom<=layout.photo.bottom,'the complete logo stays inside the photo');
    assert.ok(layout.form.width<=width,'the form stays inside the viewport');
    if(width>800)assert.ok(layout.photo.right<=layout.form.left,'photo remains to the left on desktop');
    else assert.ok(layout.photo.bottom<=layout.form.top,'photo precedes the form on smaller screens');
    await page.getByRole('button',{name:'Mostrar senha',exact:true}).click();
    assert.equal(await page.locator('#login [name=password]').getAttribute('type'),'text');
    await page.getByRole('button',{name:'Ocultar senha',exact:true}).click();
    assert.equal(await page.locator('#login [name=password]').getAttribute('type'),'password');
    await page.screenshot({path:`output/login-2026-10-07/login-${theme}-${width}.png`,fullPage:true});
    await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('Login: photo, full logo, no theme selector, password visibility and responsive layout OK in both themes (no Firebase writes).');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
