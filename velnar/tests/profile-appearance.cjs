const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");

// Minimal Primer styles and the same section structure as GitHub's profile fragment.
const profile = `<!doctype html><html lang="en" data-color-mode="dark"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root { --borderColor-default: #3d444d; --bgColor-muted: #161b22; }
body { margin: 16px; font: 16px system-ui; }
.Box, .graph-before-activity-overview { border: 1px solid var(--borderColor-default); border-radius: 6px; }
.js-yearly-contributions:has(.activity-overview-box) .graph-before-activity-overview { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
.activity-overview-box { border-top-width: 0; border-radius: 0 0 6px 6px; }
.graph-before-activity-overview, .activity-overview-box, .Box-body { padding: 16px; }
.Box-header { margin: -1px -1px 0; border: 1px solid var(--borderColor-default); border-radius: 6px 6px 0 0; background: var(--bgColor-muted); padding: 12px; }
.Box-footer { border-top: 1px solid var(--borderColor-default); border-radius: 0 0 6px 6px; padding: 12px; }
.btn, .Button { font: inherit; cursor: pointer; }
.btn-link, .Button--invisible, [data-variant="invisible"] { padding: 0; border: 0; background: transparent; color: inherit; }
summary { display: inline-block; }
</style></head><body>
<section class="js-pinned-items-reorder-container"><button class="Button Button--invisible pinned-items-setting-link" aria-pressed="false">Customize your pins</button></section>
<section class="js-yearly-contributions">
  <div class="position-relative">
    <h2>Contributions</h2>
    <details><summary class="btn btn-link">Contribution settings</summary><button type="button">Activity overview</button></details>
    <div class="graph-before-activity-overview">Contribution graph</div>
  </div>
  <div id="user-activity-overview"><div class="Box activity-overview-box"><h3>Activity overview</h3></div></div>
</section>
<section class="Box" id="standalone"><header class="Box-header">Header</header><div class="Box-body">Content</div><footer class="Box-footer">Footer</footer></section>
<p><button class="btn" id="default-button">Regular button</button> <button class="Primer-ButtonBase" data-variant="invisible">Invisible variant</button></p>
<script>document.querySelector('.pinned-items-setting-link').addEventListener('click', event => event.target.setAttribute('aria-pressed', 'true'));</script>
</body></html>`;

(async () => {
  const extension = path.resolve(__dirname, "../extension");
  const browser = await chromium.launch({
    executablePath: process.env.NEXORA_BROWSER || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.setContent(profile);
    for (const file of ["utils/constants.js", "themes/presets.js", "content/injector.js"]) {
      await page.addScriptTag({ path: path.join(extension, file) });
    }
    await page.evaluate(() => {
      const extension = globalThis.NEXORA || globalThis.VELNAR;
      extension.Injector.applyThemeVars(extension.getThemeById("spider-man").colors, { borderRadius: 20 });
      extension.Injector.applyComponents();
    });
    const style = (selector, property) => page.locator(selector).evaluate((el, key) => getComputedStyle(el)[key], property);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator(".activity-overview-box").hover();
      assert.equal(await style(".graph-before-activity-overview", "borderTopLeftRadius"), "20px");
      assert.equal(await style(".graph-before-activity-overview", "borderBottomLeftRadius"), "0px");
      assert.equal(await style(".activity-overview-box", "borderTopLeftRadius"), "0px");
      assert.equal(await style(".activity-overview-box", "borderTopRightRadius"), "0px");
      assert.equal(await style(".activity-overview-box", "borderTopWidth"), "0px");
      assert.equal(await style(".activity-overview-box", "borderBottomLeftRadius"), "20px");
      assert.equal(await style(".activity-overview-box", "borderLeftColor"), await style(".graph-before-activity-overview", "borderLeftColor"));
      assert.equal(await page.evaluate(() => {
        const graph = document.querySelector(".graph-before-activity-overview").getBoundingClientRect();
        const activity = document.querySelector(".activity-overview-box").getBoundingClientRect();
        return graph.bottom === activity.top && graph.left === activity.left && graph.right === activity.right;
      }), true, `joined edges at ${width}px`);
      assert.equal(await style(".Box-header", "borderTopLeftRadius"), "20px");
      assert.equal(await style(".Box-footer", "borderBottomRightRadius"), "20px");
      for (const selector of ["summary", ".pinned-items-setting-link", '[data-variant="invisible"]']) {
        assert.equal(await style(selector, "borderLeftWidth"), "0px", selector);
        assert.equal(await style(selector, "backgroundColor"), "rgba(0, 0, 0, 0)", selector);
      }
      assert.equal(await style("#default-button", "borderLeftWidth"), "1px");
      assert.notEqual(await style("#default-button", "backgroundColor"), "rgba(0, 0, 0, 0)");
    }
    await page.locator("summary").focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("details").evaluate(el => el.open), true);
    await page.locator(".pinned-items-setting-link").click();
    assert.equal(await page.locator(".pinned-items-setting-link").getAttribute("aria-pressed"), "true");
    await page.locator("#user-activity-overview").evaluate(el => el.remove());
    assert.equal(await style(".graph-before-activity-overview", "borderBottomLeftRadius"), "20px");
    console.log("PASS: joined profile panels, card corners, text controls and keyboard activation");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
