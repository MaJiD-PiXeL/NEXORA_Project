// Verify upgrades from VELNAR and review the actual NEXORA UI in both languages.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, 'artifacts/nexora');

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'nexora-brand-')), {
    executablePath: process.env.NEXORA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true, viewport: { width: 1440, height: 1040 },
    args: [`--disable-extensions-except=${path.join(root, 'extension')}`, `--load-extension=${path.join(root, 'extension')}`]
  });
  const errors = [];
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  try {
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const base = `chrome-extension://${worker.url().split('/')[2]}`;
    // Let installation finish, then simulate existing storage before the upgrade.
    await worker.evaluate(() => NEXORA.Storage.set({}));
    const legacy = await worker.evaluate(async () => {
      await NEXORA.Storage.savePersonal({ name: 'پالت من', colors: NEXORA.PRESET_THEMES[0].colors });
      const saved = await NEXORA.Storage.get();
      await NEXORA.Storage.toggleFavorite(saved.personalThemes[0].id);
      await NEXORA.Storage.selectTheme(saved.personalThemes[0].id);
      const backup = await NEXORA.Storage.set({ language: 'fa', typography: { fontSize: 18 } });
      await chrome.storage.local.clear();
      await chrome.storage.local.set({ velnar_settings_v1: backup });
      return backup;
    });
    const page = await context.newPage();
    await page.goto(`${base}/options/options.html`);
    await page.locator('#activeThemeName').filter({ hasText: 'پالت من' }).waitFor();
    assert.deepEqual(await page.evaluate(() => NEXORA.Storage.get()), legacy);
    assert.equal(await page.title(), 'تنظیمات NEXORA');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => document.fonts.check('14px Vazirmatn')), true);
    assert.match(await page.locator('body').evaluate(el => getComputedStyle(el).fontFamily), /Vazirmatn/);
    await page.screenshot({ path: path.join(artifacts, 'settings-fa.png') });
    await page.evaluate(() => NEXORA.Storage.set({}));
    const migrated = await worker.evaluate(() => chrome.storage.local.get(['velnar_settings_v1', 'nexora_settings_v1']));
    assert.deepEqual(migrated.velnar_settings_v1, legacy);
    assert.deepEqual(migrated.nexora_settings_v1, legacy);
    await page.locator('[data-tab="about"]').click();
    assert.match(await page.locator('#tab-about').innerText(), /فراتر از آنچه هست/);
    assert.doesNotMatch(await page.locator('body').innerText(), /VELNAR|MAVAJ/i);
    const popup = await context.newPage();
    await popup.setViewportSize({ width: 380, height: 600 });
    await popup.goto(`${base}/popup/popup.html`);
    await popup.locator('.gs-theme-select').first().waitFor();
    await popup.evaluate(() => document.fonts.ready);
    assert.equal(await popup.title(), 'NEXORA — استودیوی گیت‌هاب');
    assert.equal(await popup.evaluate(() => document.documentElement.scrollHeight <= innerHeight), true);
    await popup.screenshot({ path: path.join(artifacts, 'popup-fa.png') });
    await page.evaluate(() => NEXORA.Storage.set({ language: 'en' }));
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    await page.locator('[data-tab="themes"]').click();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => document.fonts.check('14px Manrope')), true);
    await page.screenshot({ path: path.join(artifacts, 'settings-en.png') });
    const landing = await context.newPage();
    await landing.goto(pathToFileURL(path.join(root, 'landing/index.html')).href);
    await landing.evaluate(() => document.fonts.ready);
    assert.equal(await landing.evaluate(() => document.fonts.check('14px Manrope')), true);
    assert.doesNotMatch(await landing.locator('body').innerText(), /VELNAR|MAVAJ/i);
    for (const img of await landing.locator('img').all()) assert.equal(await img.evaluate(el => el.complete && el.naturalWidth > 0), true);
    for (const width of [1440, 390]) {
      await landing.setViewportSize({ width, height: 960 });
      assert.equal(await landing.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await landing.screenshot({ path: path.join(artifacts, `landing-${width}.png`) });
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ passed: true, migration: 'velnar_settings_v1 -> nexora_settings_v1', languages: ['en', 'fa'], errors }, null, 2));
    console.log('PASS: VELNAR library/history/preferences migration, untouched legacy backup, NEXORA metadata, local fonts, EN/FA UI and responsive landing');
  } finally { await context.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
