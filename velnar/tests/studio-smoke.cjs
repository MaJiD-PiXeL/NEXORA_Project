// Run with Playwright available in NODE_PATH. Uses an isolated, temporary profile.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

(async () => {
  const artifacts = path.join(root, 'artifacts/studio');
  fs.mkdirSync(artifacts, { recursive: true });
  const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'nexora-studio-')), {
    executablePath: process.env.NEXORA_BROWSER || (fs.existsSync(edge) ? edge : undefined), headless: true,
    viewport: { width: 1440, height: 1040 },
    args: [`--disable-extensions-except=${path.join(root, 'extension')}`, `--load-extension=${path.join(root, 'extension')}`]
  });
  const errors = [];
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  try {
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const base = `chrome-extension://${worker.url().split('/')[2]}`;
    const page = await context.newPage();
    await page.goto(`${base}/options/options.html`);
    await page.locator('#activeThemeName').filter({ hasText: 'Dark' }).waitFor();
    assert.equal(await page.locator('.gs-theme-choice').count(), 48);
    const beforePreview = await page.evaluate(() => NEXORA.Storage.get());
    await page.getByRole('button', { name: 'Preview Dracula', exact: true }).click();
    assert.equal(await page.locator('#previewThemeName').textContent(), 'Dracula');
    assert.deepEqual(await page.evaluate(() => NEXORA.Storage.get()), beforePreview, 'preview never writes settings');
    await page.locator('[data-surface="code"]').click();
    assert.equal(await page.locator('#workspacePreview .sample-code').count(), 1);
    await page.locator('[data-surface="profile"]').click();
    assert.equal(await page.locator('#workspacePreview .sample-graph i').count(), 91);
    await page.locator('[data-surface="repository"]').click();
    await page.locator('#btnCompare').click();
    assert.equal(await page.locator('#compareDialog').evaluate(el => el.open), true);
    assert.equal(await page.locator('#compareCurrentName').textContent(), 'Dark');
    assert.equal(await page.locator('#comparePreviewName').textContent(), 'Dracula');
    assert.notEqual(await page.locator('#compareCurrent').evaluate(el => getComputedStyle(el).backgroundColor), await page.locator('#comparePreview').evaluate(el => getComputedStyle(el).backgroundColor));
    await page.screenshot({ path: path.join(artifacts, 'comparison.png') });
    await page.locator('#btnApplyCompared').click();
    await page.locator('#activeThemeName').filter({ hasText: 'Dracula' }).waitFor();
    assert.equal(await page.locator('#compareDialog').evaluate(el => el.open), false);
    await page.locator('#btnUndoTheme').click();
    await page.locator('#activeThemeName').filter({ hasText: 'Dark' }).waitFor();
    await page.locator('#btnDensity').click();
    assert.equal(await page.locator('#themeGallery').evaluate(el => el.classList.contains('is-compact')), true);
    await page.reload();
    await page.locator('.gs-theme-choice').first().waitFor();
    assert.equal(await page.locator('#btnDensity').getAttribute('aria-pressed'), 'true', 'density persists');
    await page.locator('#btnDensity').click();
    await page.locator('[data-tab="themes"]').focus();
    await page.keyboard.press('/');
    assert.equal(await page.locator('#themeSearch').evaluate(el => document.activeElement === el), true);

    await page.locator('[data-category="favorites"]').click();
    await page.locator('#themeEmpty').waitFor();
    await page.locator('#btnClearFilters').click();
    await page.getByRole('button', { name: 'Favorite Dracula', exact: true }).click();
    await page.locator('[data-category="favorites"]').click();
    await page.getByRole('button', { name: 'Apply Dracula theme', exact: true }).click();
    await page.locator('#activeThemeName').filter({ hasText: 'Dracula' }).waitFor();
    await page.locator('#btnUndoTheme').click();
    await page.locator('#activeThemeName').filter({ hasText: 'Dark' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Favorite Dracula', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.locator('[data-category="all"]').click();
    await page.locator('#themeAppearance').selectOption('light');
    assert.ok(await page.locator('.gs-theme-choice').count() > 0);
    assert.ok(await page.locator('.gs-theme-choice').count() < 48);
    await page.locator('#themeSearch').fill('no-such-theme');
    await page.locator('#themeEmpty').waitFor();
    await page.locator('#btnClearFilters').click();
    await page.locator('#themeSort').selectOption('name');
    await page.evaluate(() => NEXORA.UI.status(''));
    await page.screenshot({ path: path.join(artifacts, 'settings-desktop.png') });
    await page.locator('#btnCustomizeActive').click();
    await page.locator('#builderContrast').waitFor();
    assert.match(await page.locator('#builderContrast').textContent(), /Meets AA/);
    await page.getByRole('textbox', { name: 'Text Primary color value', exact: true }).fill('#0d1117');
    await page.getByRole('textbox', { name: 'Text Primary color value', exact: true }).press('Tab');
    assert.match(await page.locator('#builderContrast').textContent(), /Below AA/);
    await page.getByRole('button', { name: 'Typography', exact: true }).click();
    await page.locator('#btnReadingComfort').click();
    await page.waitForFunction(() => getComputedStyle(document.getElementById('typographyPreview')).fontSize === '16px');
    assert.equal((await page.evaluate(() => NEXORA.Storage.get())).typography.lineHeight, 1.7);
    await page.locator('#btnResetTypography').click();
    await page.waitForFunction(() => getComputedStyle(document.getElementById('typographyPreview')).fontSize === '14px');
    await page.getByRole('button', { name: 'Components', exact: true }).click();
    await page.getByRole('searchbox', { name: 'Search components' }).fill('navbar');
    assert.equal(await page.locator('.gs-component-item').count(), 1);
    await page.getByRole('searchbox', { name: 'Search components' }).fill('not-a-component');
    assert.equal(await page.locator('#componentEmpty').isVisible(), true);
    await page.getByRole('searchbox', { name: 'Search components' }).fill('');
    await page.getByRole('button', { name: 'Themes', exact: true }).click();
    await page.evaluate(() => NEXORA.UI.status(''));
    for (const width of [390, 768, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `options overflow at ${width}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(artifacts, 'settings-mobile.png'), fullPage: true });
    const popup = await context.newPage();
    await popup.setViewportSize({ width: 380, height: 600 });
    await popup.goto(`${base}/popup/popup.html`);
    await popup.locator('.gs-theme-select').first().waitFor();
    await popup.locator('[data-category="favorites"]').click();
    assert.equal(await popup.locator('.gs-theme-select').count(), 1);
    await popup.getByRole('button', { name: 'Apply Dracula theme', exact: true }).click();
    await popup.locator('#popupThemeName').filter({ hasText: 'Dracula' }).waitFor();
    await popup.locator('#btnUndoTheme').click();
    await popup.locator('#popupThemeName').filter({ hasText: 'Dark' }).waitFor();
    await popup.locator('[data-category="all"]').click();
    assert.equal(await popup.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await popup.evaluate(() => document.documentElement.scrollHeight <= innerHeight), true, 'popup fits Chrome height limit');
    await popup.evaluate(() => NEXORA.UI.status(''));
    await popup.screenshot({ path: path.join(artifacts, 'popup.png'), fullPage: true });
    await page.reload();
    await page.locator('#activeThemeName').filter({ hasText: 'Dark' }).waitFor();
    assert.equal((await page.evaluate(() => NEXORA.Storage.get())).favoriteThemeIds.includes('dracula'), true);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ passed: true, browser: context.browser().version(), widths: [390, 768, 1024, 1440], errors }, null, 2));
    console.log('PASS: preview without writes, repository/code/profile samples, comparison apply/undo, persistent density, keyboard search, component search, filters, typography, popup and responsive layouts');
  } finally { await context.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
