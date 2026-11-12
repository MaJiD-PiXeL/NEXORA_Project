const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const scope = vm.createContext({ structuredClone });
for (const file of ['themes/presets.js', 'utils/catalog.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../extension', file), 'utf8'), scope);
}
const { Catalog, PRESET_THEMES: themes } = scope.NEXORA;

test('library combines collection, appearance, search and favorite filters without mutating presets', () => {
  const original = themes.map(t => t.id).join(',');
  assert.equal(Catalog.filter(themes, { category: 'cinematic' }).length, 15);
  assert.equal(Catalog.filter(themes, { query: 'arctic' }).length, 1);
  assert.equal(Catalog.filter(themes, { category: 'favorites' }).length, 0);
  assert.equal(Catalog.filter(themes, { category: 'favorites', favorites: ['dark'], appearance: 'dark' })[0].id, 'dark');
  assert.equal(Catalog.filter(themes, { category: 'favorites', favorites: ['dark'], appearance: 'light' }).length, 0);
  assert.equal(Catalog.filter(themes, { query: 'DARK official' })[0].id, 'dark');
  const sorted = Catalog.filter(themes, { sort: 'name' });
  assert.ok(sorted.every((theme, i) => !i || sorted[i - 1].name.localeCompare(theme.name) <= 0));
  assert.equal(Catalog.filter(themes, { sort: 'favorites', favorites: ['dracula'] })[0].id, 'dracula');
  assert.equal(themes.map(t => t.id).join(','), original);
});

test('undo snapshots only appearance and copies custom colors independently', () => {
  const settings = { activeThemeId: 'dark', customThemeApplied: true, customTheme: { colors: { background: '#123456' } }, autoDarkMode: false, animationsEnabled: true, enabled: true, favoriteThemeIds: ['dark'] };
  const snapshot = Catalog.snapshot(settings);
  settings.customTheme.colors.background = '#ffffff';
  assert.equal(snapshot.customTheme.colors.background, '#123456');
  assert.equal('enabled' in snapshot, false);
  assert.equal('favoriteThemeIds' in snapshot, false);
  assert.equal('animationsEnabled' in snapshot, false);
});

test('readability uses contrast ratios and avoids claims for translucent surfaces', () => {
  assert.equal(Catalog.contrast('#fff', '#000'), 21);
  assert.equal(Catalog.contrast('rgb(255, 255, 255)', '#000000'), 21);
  assert.equal(Catalog.contrast('#333333', '#333333'), 1);
  assert.equal(Catalog.contrast('rgba(255,255,255,.5)', '#000'), null);
});
