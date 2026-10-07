import { createStaticServer } from "../../scripts/serve.mjs";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import {installAuthFixture} from "./fixtures/auth.mjs";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
const server = await createStaticServer({ port: 0, base: "/msa/" }),
  browser = await chromium.launch({ headless: true });
const url = `http://127.0.0.1:${server.address().port}/msa/`,
  errors = [];
await mkdir("output/ui", { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await installAuthFixture(page);
  await page.goto(url);
  await page.locator('#login [name=re]').fill('00000');
  await page.locator('#login [name=password]').fill('fixture-only');
  await page.locator('#login [type=submit]').click();
  await page.locator(".zones .zone").first().waitFor();
  assert.equal(await page.locator(".zones .zone").count(), 21);
  const pixels = await page.locator("#production-chart").evaluate((canvas) => {
    const ctx = canvas.getContext("2d"),
      data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i]) painted++;
    return painted;
  });
  assert.ok(pixels > 1000);
  await page.screenshot({
    path: "output/ui/dashboard-light.png",
    fullPage: true,
  });
  await page.locator('a[href="#parameters"]').first().click();
  await page.locator("#parameter-results").waitFor();
  assert.equal(await page.locator("#parameter-results tbody tr").count(), 41);
  await page.locator("#parameter-search").fill("Vacuo");
  assert.ok((await page.locator("#parameter-results tbody tr").count()) < 41);
  await page.locator("[data-parameter]").first().click();
  await page.locator("#modal[open]").waitFor();
  await page.locator("[data-action=close-modal]").first().click();
  await page.locator('a[href="#operations"]').first().click();
  await page.locator('[data-action="form:production"]').click();
  await page.locator("#modal [name=quantity]").fill("120");
  await page
    .locator("#modal [name=startedAt]")
    .fill(
      new Date(Date.now() - 3 * 3600000 - 3600000).toISOString().slice(0, 16),
    );
  await page
    .locator("#modal [name=endedAt]")
    .fill(new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 16));
  await page.locator("#modal [type=submit]").click();
  await page.waitForFunction(() => !document.getElementById("modal").open);
  await page.getByText("120 peças · Bruta", { exact: true }).waitFor();
  await page.locator('a[href="#engineering"]').first().click();
  await page.locator('[data-action^="start:"]').first().click();
  await page.locator('[data-action^="decide:"]').first().click();
  await page.locator("#modal [name=decision]").selectOption("approved");
  await page
    .locator("#modal [name=justification]")
    .fill("Verificação do fluxo de demonstração");
  await page.locator("#modal [type=submit]").click();
  await page.waitForFunction(() => !document.getElementById("modal").open);
  await page.locator('a[href="#history"]').first().click();
  const download = page.waitForEvent("download");
  await page.locator("[data-action=export]").click();
  assert.ok((await download).suggestedFilename().endsWith(".csv"));
  await page.locator('a[href="#registry"]').first().click();
  await page.locator('[data-action="form:registry-machine"]').click();
  await page.locator("#modal [name=name]").fill("   ");
  await page.locator("#modal [type=submit]").click();
  await page.locator("#modal .form-error:not(:empty)").waitFor();
  assert.equal(await page.locator("#modal [type=submit]").isDisabled(), false);
  await page.locator("#modal [name=name]").fill("Máquina de teste UI");
  await page.locator("#modal [name=code]").fill("AUDIT_UI");
  await page.locator("#modal [type=submit]").click();
  await page.waitForFunction(() => !document.getElementById("modal").open);
  await page.getByText("Máquina de teste UI", { exact: true }).waitFor();
  await page.reload();
  await page.getByText("Máquina de teste UI", { exact: true }).waitFor();
  assert.equal(await page.getByText("Máquina de teste UI", { exact: true }).count(), 1);
  await page.locator('a[href="#settings"]').first().click();
  await page.locator("[data-theme-choice=dark]").click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.reload();
  await page.locator("[data-theme-choice=dark]").waitFor();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.goto(url + "#dashboard");
  await page.locator(".zones .zone").first().waitFor();
  await page.screenshot({
    path: "output/ui/dashboard-dark.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "output/ui/dashboard-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.locator("[data-action=menu]").click();
  await page.locator('a[href="#settings"]').first().click();
  await page.locator("[data-theme-choice=light]").waitFor();
  await page.screenshot({
    path: "output/ui/settings-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url + "#dashboard");
  await page.locator('[data-action="form:collection"]').click();
  assert.equal(await page.locator("#modal [name^=raw_]").count(), 41);
  await page.locator("#modal [name^=raw_]").first().fill("25,5");
  await page.locator("#modal [type=submit]").click();
  await page.waitForFunction(() => !document.getElementById("modal").open);
  await page.locator('a[href="#operations"]').first().click();
  await page.locator("[data-tab=stoppages]").click();
  await page.locator('[data-action="form:stoppage"]').click();
  await page
    .locator("#modal [name=startedAt]")
    .fill(
      new Date(Date.now() - 3 * 3600000 - 600000).toISOString().slice(0, 16),
    );
  await page
    .locator("#modal [name=reasonId]")
    .selectOption({ label: "Ajuste simulado" });
  await page.locator("#modal [type=submit]").click();
  await page.waitForFunction(() => !document.getElementById("modal").open);
  await page.locator('[data-action^="close:"]').first().click();
  await page.locator("#modal [type=submit]").click();
  await page.waitForFunction(() => !document.getElementById("modal").open);
  await page.locator("[data-tab=losses]").click();
  await page.locator('[data-action="form:loss"]').click();
  await page.locator("#modal [name=kind]").selectOption("material");
  assert.equal(await page.locator("#modal [name=unit]").inputValue(), "kg");
  await page.locator("#modal [name=amount]").fill("1,5");
  await page.locator("#modal [type=submit]").click();
  await page.waitForFunction(() => !document.getElementById("modal").open);
  await page.getByText(/1,5 kg/).waitFor();
  await page.locator('a[href="#registry"]').first().click();
  await page.locator("[data-tab=parameters]").click();
  await page.locator('[data-action^="version:"]').first().click();
  await page.locator("#modal [name=nature]").selectOption("measurement");
  assert.equal(
    await page.locator("#modal [name=status]").inputValue(),
    "draft",
  );
  await page.locator("#modal [type=submit]").click();
  await page.waitForFunction(() => !document.getElementById("modal").open);
  await page.locator("[data-tab=targets]").click();
  await page.locator('[data-action="form:target"]').click();
  await page.locator("#modal [name=name]").fill("Meta UI");
  await page.locator("#modal [name=metric]").selectOption("producedPieces");
  await page.locator("#modal [name=threshold]").fill("50");
  await page.locator("#modal [type=submit]").click();
  await page.waitForFunction(() => !document.getElementById("modal").open);
  await page.getByText("Meta UI", { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      ok: true,
      parameters: 41,
      zones: 21,
      canvasPaintedPixels: pixels,
      errors,
    }),
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
