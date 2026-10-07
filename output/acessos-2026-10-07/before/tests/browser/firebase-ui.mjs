import { createStaticServer } from "../../scripts/serve.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
assert.ok(
  process.env.MSA_TEST_PASSWORD,
  "MSA_TEST_PASSWORD is required; never stored in this file.",
);
assert.ok(process.env.MSA_TEST_EMAIL,"MSA_TEST_EMAIL is required; never stored in this file.");
const server = await createStaticServer({ port: 0 }),
  browser = await chromium.launch({ headless: true }),
  errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.locator('#login').waitFor();
  await page.locator('#login [name=email]').fill(process.env.MSA_TEST_EMAIL);
  await page.locator('#login [name=password]').fill(process.env.MSA_TEST_PASSWORD);
  await page.locator('#login [type=submit]').click();
  await page.locator("[data-action=logout]").waitFor({ timeout: 60000 });
  assert.equal(await page.locator(".zones .zone").count(), 21);
  await page.reload();
  await page.locator("[data-action=logout]").waitFor({ timeout: 60000 });
  const counts = await page.evaluate(async () => {
    const sdk = await import("/src/repositories/firebase-sdk-browser.js");
    const { createFirebaseRepository } = await import(
      "/src/repositories/firebase-repository.js"
    );
    const repo = createFirebaseRepository({
        db: sdk.getDatabase(),
        sdk,
        workspaceId: "msa",
      }),
      counts = {};
    for (const root of ["collections", "production", "losses", "stoppages"]) {
      const rows = Object.values((await repo.get(root)) ?? {});
      if (rows.some((r) => r.origin !== "demo" || r.source?.file !== "cenario-ficticio-c26"))
        throw Error("Scenario provenance missing");
      counts[root] = rows.length;
    }
    return counts;
  });
  console.log(
    "Authorized synthetic scenario: " + JSON.stringify(counts),
  );
  assert.deepEqual(counts, {collections:28, production:56, losses:94, stoppages:29});
  const operationalSnapshot=()=>page.evaluate(async()=>{
    const sdk=await import('/src/repositories/firebase-sdk-browser.js');
    return JSON.stringify((await sdk.get(sdk.ref(sdk.getDatabase(),'workspaces/msa/production'))).val());
  });
  const beforeSimulation=await operationalSnapshot();
  await page.locator('[data-action=simulate]').click();
  await page.locator('#modal [name=scenario]').selectOption('outside');
  await page.locator('#modal [type=submit]').click();
  await page.waitForFunction(()=>!document.getElementById('modal').open);
  await page.locator('.simulation-notice').waitFor();
  await page.locator('[data-action=end-simulation]').click();
  await page.locator('[data-action=logout]').waitFor();
  await page.waitForFunction(()=>document.querySelector('[data-context=machineId]')?.value==='c26-t20');
  assert.equal(await operationalSnapshot(),beforeSimulation);
  assert.equal(await page.locator('.rail').evaluate(el => el.getBoundingClientRect().width),64);
  assert.equal(await page.locator('.rail .brand-mark, .connection, .period-label, .topbar [data-action=theme]').count(),0);
  await mkdir("output/ui", { recursive: true });
  await page.screenshot({
    path: "output/ui/firebase-dashboard.png",
    fullPage: true,
  });
  await page.locator('a[href="#settings"]').first().click();
  await page.locator('#profile-form [name=displayName]').fill('Fabiana Dias');
  await page.locator('#profile-form [type=submit]').click();
  await page.waitForFunction(() => document.querySelector('.avatar')?.title === 'Fabiana Dias');
  await page.waitForFunction(async () => (await import('/src/repositories/firebase-sdk-browser.js')).getAuth().currentUser.displayName === 'Fabiana Dias');
  await page.getByText('Perfil salvo.', {exact:true}).waitFor();
  assert.equal(await page.locator('.avatar').textContent(),'FD');
  assert.equal(await page.getByText('Conta e ambiente',{exact:true}).count(),0);
  await page.screenshot({path:'output/ui/firebase-settings.png',fullPage:true});
  await page.locator('#compact-toggle').check();
  assert.ok(await page.locator('body').evaluate(el => el.classList.contains('compact-tables')));
  await page.locator('#default-period').selectOption('14');
  await page.locator('a[href="#dashboard"]').first().click();
  await page.locator('#period').waitFor();
  assert.equal(await page.locator('#period').inputValue(),'14');
  await page.locator('a[href="#settings"]').first().click();
  await page.locator('[data-action=reset-consultation]').click();
  await page.locator('[data-action=change-password]').click();
  await page.locator('#modal [name=current]').fill('not-sent');
  await page.locator('#modal [name=next]').fill('not-sent-new');
  await page.locator('#modal [name=confirm]').fill('different');
  await page.locator('#modal [type=submit]').click();
  await page.getByText('As senhas não coincidem.', {exact:true}).first().waitFor();
  await page.locator('[data-action=close-modal]').first().click();
  for(const route of ['parameters','operations','engineering','history','registry']){
    await page.locator(`a[href="#${route}"]`).first().click();
    await page.locator('#page .data-table tbody tr').first().waitFor();
    assert.ok(await page.locator('#page .data-table tbody tr').count()>0);
  }
  await page.locator('a[href="#dashboard"]').first().click();
  await page.locator('#production-chart').waitFor();
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'output/ui/firebase-dashboard-mobile.png',fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.setViewportSize({width:1440,height:900});
  await page.locator('a[href="#settings"]').first().click();
  await page.locator("#vlibras-toggle").check();
  await page.waitForFunction(
    () => window.VLibrasWidget?.initBtn,
    {},
    { timeout: 45000 },
  );
  await Promise.all([
    page.waitForEvent("load"),
    page.locator("#vlibras-toggle").uncheck(),
  ]);
  await page.locator("#vlibras-toggle").waitFor();
  assert.equal(await page.locator("#vlibras-toggle").isChecked(), false);
  assert.equal(await page.evaluate(() => !!window.VLibrasWidget), false);
  await page.locator("[data-action=logout]").click();
  await page.locator("#login").waitFor();
  await page.reload();
  await page.locator("#login").waitFor();
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      ok: true,
      realFirebaseLogin: true,
      persistentSession: true,
      vlibras: true,
      logout: true,
      errors,
    }),
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
