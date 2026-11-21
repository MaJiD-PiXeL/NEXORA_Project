// Exercises the real extension against local fixtures; no GitHub account needed.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, 'artifacts/static-themes');
const ids = ['nexora-theme-vars', 'nexora-components', 'nexora-typography', 'nexora-custom-css'];
const retired = '#nexora-cinematic-scene,#nexora-cinematic-components,#nexora-world-banner,#nexora-world-skin,.nexora-graph-scene,#nexora-animations,#nexora-web-swinger';
const rgb = hex => `rgb(${hex.slice(1).match(/../g).map(n => parseInt(n, 16)).join(', ')})`;

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'nexora-static-')), {
    executablePath: process.env.NEXORA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true, viewport: { width: 1440, height: 1024 },
    args: ['--disable-extensions-except=' + path.join(root, 'extension'), '--load-extension=' + path.join(root, 'extension')]
  });
  const errors = [];
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  try {
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const base = `chrome-extension://${worker.url().split('/')[2]}`;
    const options = await context.newPage();
    await options.goto(`${base}/options/options.html`);
    await options.locator('.gs-theme-choice').first().waitFor();
    // Simulate an upgrade with motion enabled in the old installation.
    await options.evaluate(() => chrome.storage.local.set({ [NEXORA.STORAGE_KEY]: {
      ...NEXORA.DEFAULT_SETTINGS, activeThemeId: 'spider-man', animationsEnabled: true, webSwingerEnabled: true
    } }));
    const profile = await context.newPage();
    await profile.route('https://github.com/nexora-static*', route => route.fulfill({ contentType: 'text/html',
      body: fs.readFileSync(path.join(__dirname, 'fixtures/profile.html'), 'utf8') }));
    await profile.goto('https://github.com/nexora-static');
    await profile.locator('#nexora-theme-vars').waitFor({ state: 'attached' });
    assert.equal(await profile.locator(retired).count(), 0);
    const themes = await options.evaluate(() => NEXORA.PRESET_THEMES);
    assert.equal(themes.length, 48);
    for (const theme of themes) {
      await options.evaluate(id => NEXORA.Storage.selectTheme(id), theme.id);
      await profile.waitForFunction(expected => getComputedStyle(document.body).backgroundColor === expected, rgb(theme.colors.background));
      assert.equal(await profile.locator(retired).count(), 0, theme.id);
      assert.equal(await profile.evaluate(() => document.getAnimations().length), 0, theme.id);
    }
    // Each stylesheet recovers independently without a navigation event.
    for (const id of ids) {
      await profile.evaluate(id => document.getElementById(id).remove(), id);
      await profile.locator('#' + id).waitFor({ state: 'attached' });
    }
    // GitHub may replace its head, including between Turbo events.
    await profile.evaluate(() => document.head.replaceWith(document.createElement('head')));
    for (const id of ids) await profile.locator('#' + id).waitFor({ state: 'attached' });
    await profile.evaluate(() => {
      window.styleMutations = 0;
      new MutationObserver(records => window.styleMutations += records.length)
        .observe(document.head, { childList: true, subtree: true, characterData: true });
      for (const event of ['turbo:load', 'turbo:render', 'pjax:end']) document.dispatchEvent(new Event(event));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await profile.waitForTimeout(1000);
    assert.equal(await profile.evaluate(() => window.styleMutations), 0, 'unchanged styles produce no writes');
    await options.evaluate(() => NEXORA.Storage.set({ enabled: false }));
    await profile.waitForFunction(ids => ids.every(id => !document.getElementById(id)), ids);
    await profile.evaluate(() => { window.styleMutations = 0; document.head.append(document.createElement('meta')); });
    await profile.waitForTimeout(1000);
    assert.equal(await profile.evaluate(() => window.styleMutations), 1, 'disabled extension does not retry injection');
    await options.evaluate(() => NEXORA.Storage.set({ enabled: true, autoDarkMode: true }));
    await profile.emulateMedia({ colorScheme: 'light' });
    await profile.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)');
    await profile.emulateMedia({ colorScheme: 'dark' });
    await profile.waitForFunction(() => getComputedStyle(document.body).backgroundColor === 'rgb(13, 17, 23)');

    // Settings changes should reuse the existing library and preview elements.
    await options.evaluate(() => {
      window.firstCard = document.querySelector('.gs-theme-card');
      window.sampleHeader = document.querySelector('#workspacePreview .sample-header');
      return NEXORA.Storage.set({ typography: { fontSize: 16 } });
    });
    await options.waitForFunction(() => document.querySelector('#fontSize').value === '16');
    assert.equal(await options.evaluate(() => window.firstCard === document.querySelector('.gs-theme-card')), true);
    assert.equal(await options.evaluate(() => window.sampleHeader === document.querySelector('#workspacePreview .sample-header')), true);
    assert.equal(await options.locator('#settingAnimations,#settingWebSwinger').count(), 0);
    const popup = await context.newPage();
    await popup.goto(`${base}/popup/popup.html`);
    await popup.locator('.gs-theme-select').first().waitFor();
    assert.equal(await popup.locator('#btnAnimations').count(), 0);
    const preview = await context.newPage();
    await preview.goto(`${base}/preview/preview.html`);
    for (const theme of themes.filter(theme => theme.scene)) {
      await preview.locator(`[data-theme="${theme.id}"]`).click();
      assert.equal(await preview.locator('#sceneTitle').textContent(), theme.name);
      assert.equal(await preview.evaluate(() => document.getAnimations().length), 0);
    }
    const landing = await context.newPage();
    await landing.goto(pathToFileURL(path.join(root, 'landing/index.html')).href);
    assert.equal(await landing.locator('#worldPicker button').count(), 15);
    assert.equal(await landing.evaluate(() => document.getAnimations().length), 0);
    await options.screenshot({ path: path.join(artifacts, 'settings.png') });
    await profile.screenshot({ path: path.join(artifacts, 'github.png') });
    assert.deepEqual(errors, []);
    const scripts = JSON.parse(fs.readFileSync(path.join(root, 'extension/manifest.json'))).content_scripts[0].js;
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ passed: true, themes: themes.length,
      animations: 0, unchangedStyleWrites: 0, scripts: scripts.length,
      scriptBytes: scripts.reduce((sum, file) => sum + fs.statSync(path.join(root, 'extension', file)).size, 0), errors }, null, 2));
    console.log('PASS: 48 static palettes, old settings migration, no motion, stylesheet/head recovery, zero idle writes, system appearance, library reuse, preview and landing');
  } finally { await context.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
