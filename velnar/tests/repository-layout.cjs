// Reproduces the profile repository tab shown in the reported screenshot.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, 'artifacts/repository-layout');

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'nexora-repositories-')), {
    executablePath: process.env.NEXORA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true, viewport: { width: 1193, height: 980 },
    args: [`--disable-extensions-except=${path.join(root, 'extension')}`, `--load-extension=${path.join(root, 'extension')}`]
  });
  const errors = [];
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  try {
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const base = `chrome-extension://${worker.url().split('/')[2]}`;
    const settings = await context.newPage();
    await settings.goto(`${base}/options/options.html`);
    await settings.locator('.gs-theme-choice').first().waitFor();
    await settings.evaluate(() => NEXORA.Storage.set({ customTheme: NEXORA.Validator.theme({ name: 'Screenshot palette', colors: { background: '#0a111b', repoBackground: '#182536', backgroundSecondary: '#182536', textPrimary: '#c3d3ea', link: '#f3cd58', accent: '#f3cd58', button: '#f3cd58', buttonText: '#161b22' } }), customThemeApplied: true }));
    const page = await context.newPage();
    await page.route('https://github.com/nexora-repositories*', route => route.fulfill({ contentType: 'text/html', body: fs.readFileSync(path.join(__dirname, 'fixtures/repositories.html'), 'utf8') }));
    await page.goto('https://github.com/nexora-repositories?tab=repositories');
    await page.locator('#nexora-components').waitFor({ state: 'attached' });
    const measure = () => page.evaluate(() => {
      const rows = [...document.querySelectorAll('#user-repositories-list > ul > li')];
      return rows.map((row, index) => {
        const rect = row.getBoundingClientRect(), details = row.querySelector('.repo-details').getBoundingClientRect(), actions = row.querySelector('.repo-actions').getBoundingClientRect();
        const style = getComputedStyle(row);
        const next = rows[index + 1]?.getBoundingClientRect();
        return { inset: details.left - rect.left, actionInset: rect.right - actions.right, gap: next ? next.top - rect.bottom : null, border: style.borderLeftWidth, radius: style.borderTopLeftRadius, background: style.backgroundColor, overlap: details.right > actions.left + 1 };
      });
    });
    for (const width of [1193, 768, 390]) {
      await page.setViewportSize({ width, height: 980 });
      for (const row of await measure()) {
        assert.ok(row.inset >= 12, `content inset at ${width}: ${row.inset}`);
        assert.ok(row.actionInset >= 12, `controls inset at ${width}: ${row.actionInset}`);
        if (row.gap !== null) assert.ok(row.gap >= 12, `card spacing at ${width}: ${row.gap}`);
        assert.equal(row.border, '1px'); assert.equal(row.radius, '8px'); assert.equal(row.overlap, false);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `page overflow at ${width}`);
      const ordinary = await page.locator('#unrelated-row').evaluate(el => ({ background: getComputedStyle(el).backgroundColor, radius: getComputedStyle(el).borderRadius }));
      assert.deepEqual(ordinary, { background: 'rgba(0, 0, 0, 0)', radius: '0px' }, 'utility classes do not create cards');
      assert.equal(await page.locator('#unrelated-source').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
      const rows = page.locator('#file-list .Box-row');
      assert.equal(await rows.nth(1).evaluate(el => getComputedStyle(el).borderRadius), '0px', 'middle file row stays square');
      assert.equal(await rows.first().evaluate(el => getComputedStyle(el).borderBottomLeftRadius), '0px');
      assert.equal(await rows.last().evaluate(el => getComputedStyle(el).borderTopLeftRadius), '0px');
      const bounds = await rows.evaluateAll(els => els.map(el => ({ top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom })));
      assert.equal(bounds[1].top, bounds[0].bottom, 'file rows remain joined');
      await page.screenshot({ path: path.join(artifacts, `repositories-${width}.png`), fullPage: true });
    }
    await page.locator('.star-button').first().click();
    assert.equal(await page.locator('.star-button').first().getAttribute('aria-pressed'), 'true');
    await settings.evaluate(() => NEXORA.Storage.set({ layout: { borderRadius: 16 } }));
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#user-repositories-list li')).borderRadius === '16px');
    await settings.evaluate(() => NEXORA.Storage.set({ componentOverrides: { repoCards: false } }));
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#user-repositories-list li')).paddingLeft === '0px');
    assert.equal((await measure())[0].gap, 0, 'component toggle restores native row spacing');
    await settings.evaluate(() => NEXORA.Storage.set({ componentOverrides: { repoCards: true } }));
    await page.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector('#user-repositories-list li')).paddingLeft) >= 12);
    // Filtering/pagination can replace the whole list without notifying the extension.
    await page.evaluate(() => { const row = document.querySelector('#user-repositories-list li'); row.parentElement.append(row.cloneNode(true)); });
    assert.equal((await measure()).at(-1).border, '1px');
    await page.evaluate(() => document.dispatchEvent(new Event('turbo:render')));
    assert.ok((await measure())[0].gap >= 12);
    await settings.evaluate(() => NEXORA.Storage.set({ enabled: false }));
    await page.waitForFunction(() => !document.getElementById('nexora-components'));
    assert.equal((await measure())[0].inset, 0, 'disabling restores native padding');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ passed: true, browser: context.browser().version(), widths: [390, 768, 1193], errors }, null, 2));
    console.log('PASS: inset/spaced repository cards, no utility-row spillover, joined file rows, responsive long names, controls, radius, component toggle and dynamic lists');
  } finally { await context.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
