import assert from "node:assert/strict";
import { createStaticServer } from "../../scripts/serve.mjs";
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdir} from 'node:fs/promises';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
const server = await createStaticServer({ port: 0 }),
  browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.locator(".zones .zone").first().waitFor({ timeout: 5000 });
  assert.equal(await page.locator("#login").count(), 0);
  assert.equal(await page.locator(".zones .zone").count(), 21);
  assert.doesNotMatch(
    await page.locator("body").innerText(),
    /prot[oó]tipo|demonstra[çc][aã]o|Desafio de Ideias|sint[eé]tico/i,
  );
  assert.ok(
    (await page.locator(".metric").first().innerText()).includes("Sem dados"),
  );
  await page.locator("[data-action=connect]").first().click();
  await page.locator("#modal[open] [name=password]").waitFor();
  assert.equal(await page.locator(".login-rail").count(), 0);
  await page.locator('[data-action=close-modal]').first().click();
  await mkdir('output/ui',{recursive:true});
  await page.setViewportSize({width:1440,height:900});
  await page.screenshot({path:'output/ui/operational-empty-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'output/ui/operational-empty-mobile.png',fullPage:true,animations:'disabled'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.route('http://127.0.0.1:5173/**',async route=>{
    const response=await route.fetch({url:route.request().url().replace(':5173',`:${server.address().port}`)});
    await route.fulfill({response});
  });
  await page.goto(pathToFileURL(resolve('index.html')).href);
  await page.locator('.zones .zone').first().waitFor();
  assert.equal(page.url(),'http://127.0.0.1:5173/#dashboard');
  console.log("Direct dashboard entry: OK");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
