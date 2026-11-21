const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../extension");
const source = file => fs.readFileSync(path.join(root, file), "utf8");

function harness(initial = {}) {
  let data = structuredClone(initial), failWrite = false;
  const changes = [], messages = [], commands = [], installs = [];
  const runtime = {
    id: "nexora-test", lastError: null, getURL: suffix => "chrome-extension://nexora-test/" + suffix,
    onMessage: { addListener: fn => messages.push(fn) }, onInstalled: { addListener: fn => installs.push(fn) }
  };
  const chrome = { runtime, commands: { onCommand: { addListener: fn => commands.push(fn) } }, storage: {
    local: {
      get(keys, callback) { setTimeout(() => callback(structuredClone(data)), 1); },
      set(next, callback) {
        setTimeout(() => {
          if (failWrite) { failWrite = false; runtime.lastError = { message: "Storage unavailable" }; callback(); runtime.lastError = null; return; }
          const update = Object.fromEntries(Object.entries(next).map(([key, value]) => [key, { oldValue: data[key], newValue: structuredClone(value) }]));
          data = { ...data, ...structuredClone(next) }; callback(); changes.forEach(fn => fn(update, "local"));
        }, 1);
      }
    },
    onChanged: { addListener: fn => changes.push(fn), removeListener: fn => { const i = changes.indexOf(fn); if (i >= 0) changes.splice(i, 1); } }
  } };
  runtime.sendMessage = (message, callback) => messages[0](message, { id: runtime.id, url: runtime.getURL("options/options.html") }, callback);
  function context(worker) {
    const scope = vm.createContext({ chrome, structuredClone, console, setTimeout, crypto: require("node:crypto").webcrypto });
    if (worker) {
      scope.importScripts = (...files) => files.forEach(file => vm.runInContext(source(path.join("background", file)), scope, { filename: file }));
      vm.runInContext(source("background/service-worker.js"), scope);
    } else {
      scope.window = scope;
      for (const file of ["utils/constants.js", "themes/presets.js", "utils/validator.js", "utils/storage.js"]) vm.runInContext(source(file), scope);
    }
    return scope;
  }
  const worker = context(true);
  return { worker, page: () => context(false), data: () => data, fail: () => failWrite = true, messages, commands, installs };
}

test("manifest files exist and service worker starts without window", () => {
  const manifest = JSON.parse(source("manifest.json"));
  assert.equal(manifest.version, require("../package.json").version); assert.ok(manifest.description.length <= 132);
  for (const file of [...manifest.content_scripts[0].js, ...Object.values(manifest.icons), manifest.background.service_worker, manifest.options_page, manifest.action.default_popup]) assert.ok(fs.existsSync(path.join(root, file)), file);
  const h = harness(); assert.equal(h.messages.length, 1); assert.equal(h.commands.length, 1); assert.equal(h.installs.length, 1);
});

test("writes from separate pages preserve all changes", async () => {
  const h = harness(), a = h.page().NEXORA.Storage, b = h.page().NEXORA.Storage;
  await Promise.all([a.set({ activeThemeId: "light" }), b.set({ autoDarkMode: true }), a.set({ layout: { borderRadius: 15 } }), b.set({ typography: { fontSize: 17 } })]);
  const actual = await a.get();
  assert.equal(actual.activeThemeId, "light"); assert.equal(actual.autoDarkMode, true); assert.equal(actual.layout.borderRadius, 15); assert.equal(actual.typography.fontSize, 17);
});

test("code tab width defaults for old settings, validates and survives history restoration", async () => {
  const storage = harness({ nexora_settings_v1: { typography: { fontSize: 16 } } }).page().NEXORA.Storage;
  assert.equal((await storage.get()).typography.codeTabSize, 0);
  const initial = await storage.set({ typography: { codeTabSize: 2 } });
  assert.equal(initial.typography.fontSize, 16);
  await assert.rejects(storage.set({ typography: { codeTabSize: 3 } }), /Invalid setting: typography.codeTabSize/);
  const next = await storage.set({ typography: { codeTabSize: 8 } });
  assert.equal(next.typography.codeTabSize, 8);
  const previous = next.appearanceHistory.at(-1);
  const restored = await storage.restoreHistory(next.appearanceHistory.length - 1, previous.at);
  assert.equal(restored.typography.codeTabSize, 2);
});

test("rapid toggles and favorites use the latest stored state", async () => {
  const h = harness(), a = h.page().NEXORA.Storage, b = h.page().NEXORA.Storage;
  await Promise.all([a.toggle("enabled"), b.toggle("enabled"), a.toggleFavorite("dark"), b.toggleFavorite("light")]);
  const result = await a.get(); assert.equal(result.enabled, true); assert.deepEqual([...result.favoriteThemeIds].sort(), ["dark", "light"]);
});

test("legacy settings migrate without resetting preferences", async () => {
  for (const key of ["velnar_settings_v1", "mavaj_settings_v1", "gitskin_settings_v1"]) {
    const legacy = { activeThemeId: "dracula", enabled: false, favoriteThemeIds: ["dark"], language: "fa", customCss: "body { color: red; }", typography: { fontSize: 18 } };
    const h = harness({ [key]: legacy });
    const before = await h.page().NEXORA.Storage.get();
    assert.equal(h.data().nexora_settings_v1, undefined, "reading legacy data does not write");
    await h.worker.NEXORA.Storage.set({});
    assert.deepEqual(h.data().nexora_settings_v1, JSON.parse(JSON.stringify(before)));
    assert.deepEqual(h.data()[key], legacy, "the original backup remains intact");
  }
});

test("NEXORA settings take precedence over old brands after migration or reset", async () => {
  const h = harness({ velnar_settings_v1: { activeThemeId: "dracula", enabled: false }, mavaj_settings_v1: { activeThemeId: "light" } });
  assert.equal((await h.page().NEXORA.Storage.get()).activeThemeId, "dracula");
  await h.worker.NEXORA.Storage.selectTheme("nord");
  assert.equal((await h.page().NEXORA.Storage.get()).activeThemeId, "nord");
  await h.worker.NEXORA.Storage.reset();
  assert.equal((await h.page().NEXORA.Storage.get()).activeThemeId, "dark");
  assert.equal(h.data().velnar_settings_v1.activeThemeId, "dracula");
});

test("old motion preferences are discarded on load, patch and restore", async () => {
  const h = harness({ nexora_settings_v1: { activeThemeId: "spider-man", animationsEnabled: true, webSwingerEnabled: true } });
  const storage = h.page().NEXORA.Storage;
  for (const settings of [await storage.get(), await storage.set({ animationsEnabled: true }),
    await storage.restore({ activeThemeId: "batman", animationsEnabled: true, webSwingerEnabled: true })]) {
    assert.equal(Object.hasOwn(settings, "animationsEnabled"), false);
    assert.equal(Object.hasOwn(settings, "webSwingerEnabled"), false);
  }
  assert.equal((await storage.get()).activeThemeId, "batman");
  await assert.rejects(storage.toggle("animationsEnabled"), /Unknown toggle/);
});

test("restore replaces previous custom theme and CSS, including null values", async () => {
  const h = harness(), p = h.page().NEXORA;
  await p.Storage.set({ customTheme: { name: "Old", colors: p.PRESET_THEMES[0].colors }, customThemeApplied: true, customCss: "body { opacity: .9; }", customCssEnabled: true });
  await p.Storage.restore(structuredClone(p.DEFAULT_SETTINGS));
  const restored = await p.Storage.get(); assert.equal(restored.customTheme, null); assert.equal(restored.customCss, ""); assert.equal(restored.customCssEnabled, false);
});

test("malformed import is rejected before storage changes", async () => {
  const h = harness(), p = h.page().NEXORA;
  await p.Storage.set({ activeThemeId: "nord" });
  for (const invalid of [{ favoriteThemeIds: 123 }, { typography: { fontFamily: "serif; } body { display:none" } }, { customTheme: { colors: { accent: 8 } } }, [], { layout: { borderRadius: -10 } }]) await assert.rejects(p.Storage.restore(invalid));
  assert.equal((await p.Storage.get()).activeThemeId, "nord");
});

test("failed storage write rejects and does not poison the queue", async () => {
  const h = harness(), p = h.page().NEXORA.Storage;
  h.fail(); await assert.rejects(p.set({ enabled: false }), /Storage unavailable/);
  await p.set({ activeThemeId: "nord" }); assert.equal((await p.get()).activeThemeId, "nord");
});

test("settings endpoint rejects a GitHub content-script sender", () => {
  const h = harness(); let response;
  h.messages[0]({ type: "nexora:settings", action: "reset" }, { id: "nexora-test", url: "https://github.com/" }, value => response = value);
  assert.equal(response.ok, false); assert.equal(Object.keys(h.data()).length, 0);
});

test("random theme disables system selection and custom theme", async () => {
  const p = harness().page().NEXORA;
  await p.Storage.set({ activeThemeId: "dark", autoDarkMode: true });
  const next = await p.Storage.randomTheme(); assert.notEqual(next.activeThemeId, "dark"); assert.equal(next.autoDarkMode, false); assert.equal(next.customThemeApplied, false);
});

test("cinematic selection applies palettes without motion and rejects unknown themes", async () => {
  const p = harness().page().NEXORA;
  const scenes = p.PRESET_THEMES.filter(theme => theme.category === "cinematic");
  assert.deepEqual(Array.from(scenes, theme => theme.id), ["spider-man", "the-last-of-us", "red-dead", "rick-and-morty", "iron-man", "batman", "star-wars", "harry-potter", "deadpool", "stranger-things", "wednesday", "squid-game", "god-of-war", "assassins-creed", "minecraft"]);
  for (const theme of scenes) {
    await p.Storage.set({ animationsEnabled: false, autoDarkMode: true });
    const next = await p.Storage.selectTheme(theme.id);
    assert.equal(next.activeThemeId, theme.id);
    assert.equal(next.animationsEnabled, undefined);
    assert.equal(next.autoDarkMode, false);
    assert.equal(next.customThemeApplied, false);
  }
  await assert.rejects(p.Storage.selectTheme("unknown"), /Unknown theme/);
  assert.equal((await p.Storage.get()).activeThemeId, "minecraft");
  await p.Storage.set({ animationsEnabled: false });
  assert.equal((await p.Storage.selectTheme("dark")).animationsEnabled, undefined);
});

test("CSS validation rejects external resources and escaped URLs", () => {
  const validator = harness().page().NEXORA.Validator;
  for (const css of ['@import "https://example.com/style.css";', 'body { background: url(https://example.com/pixel); }', 'body { background: u\\72l(https://example.com); }', 'body { background: u\\\nrl(https://example.com); }', 'body { background: u\\\rrl(https://example.com); }', 'body { background: image-set("https://example.com/a.png" 1x); }', '} body {', 'a'.repeat(50001)]) assert.equal(validator.validateCss(css).valid, false, css.slice(0, 90));
  for (const css of ['body { color: red; }', 'a::after { content: "{"; } /* } */', '@media (min-width: 20px) { a { color: blue; } }']) assert.equal(validator.validateCss(css).valid, true, css);
});

test("old flat theme exports remain compatible and fill new colors", () => {
  const p = harness().page().NEXORA;
  const imported = p.Validator.theme({ name: "Legacy", background: "#123456", accent: "#00f" });
  assert.equal(imported.colors.background, "#123456"); assert.equal(Object.keys(imported.colors).length, 30);
});

test("preset link/text and primary hover contrast stays readable", () => {
  const p = harness().page();
  assert.equal(p.NEXORA.PRESET_THEMES.length, 48);
  for (const theme of p.NEXORA.PRESET_THEMES) {
    assert.doesNotThrow(() => p.NEXORA.Validator.theme(theme), theme.id);
    const c = theme.colors;
    for (const [text, background] of [[c.link, c.background], [c.link, c.backgroundSecondary], [c.textSecondary, c.backgroundSecondary], [c.buttonText, c.button], [c.buttonText, c.buttonHover]]) assert.ok(p.gsContrastRatio(text, background) >= 4.5, `${theme.id}: ${text} / ${background}`);
  }
});

test("every content script parses and custom CSS works in manifest load order", () => {
  const h = harness(), p = h.page(); const tags = new Map();
  p.document = { readyState: "loading", addEventListener() {}, getElementById: id => tags.get(id), createElement: () => ({ textContent: "" }), head: { appendChild(tag) { tags.set(tag.id, tag); } } };
  p.location = { href: "https://github.com/" };
  for (const file of JSON.parse(source("manifest.json")).content_scripts[0].js) {
    const script = new vm.Script(source(file), { filename: file });
    // Startup is exercised in the real browser; this VM has no document lifecycle.
    if (file !== "content/content.js") script.runInContext(p);
  }
  p.NEXORA.Injector.applyCustomCss("body { color: red; }", true);
  assert.equal(tags.get(p.NEXORA.CUSTOM_CSS_TAG_ID).textContent, "body { color: red; }");
  assert.equal(p.NEXORA.Injector.applyAnimations, undefined);
  assert.equal(p.NEXORA.Injector.applyWebSwinger, undefined);
});

test("personal themes survive rename, backup and deletion without changing the applied copy", async () => {
  const h = harness(), a = h.page().NEXORA, b = h.page().NEXORA;
  const theme = { name: "My palette", colors: a.PRESET_THEMES[0].colors };
  await Promise.all([a.Storage.savePersonal(theme), b.Storage.savePersonal({ ...theme, name: "Second" })]);
  let settings = await a.Storage.get(); assert.equal(settings.personalThemes.length, 2);
  const id = settings.personalThemes[0].id;
  await a.Storage.toggleFavorite(id); await a.Storage.selectTheme(id);
  await a.Storage.savePersonal({ ...theme, name: "Renamed" }, id);
  settings = await a.Storage.get();
  assert.equal(settings.personalThemes[0].name, "Renamed"); assert.equal(settings.customTheme.name, "My palette");
  await a.Storage.selectTheme(id);
  const backup = JSON.parse(JSON.stringify(await a.Storage.get()));
  await a.Storage.reset(); await a.Storage.restore(backup);
  settings = await a.Storage.deletePersonal(id);
  assert.equal(settings.customTheme.name, "Renamed"); assert.equal(settings.customThemeApplied, true);
  assert.equal(settings.personalThemes.length, 1); assert.equal(settings.favoriteThemeIds.includes(id), false);
  assert.equal(settings.builderDraft.editingId, null);
  await assert.rejects(a.Storage.savePersonal(theme, id), /no longer exists/);
});

test("draft and interface language persist independently of active appearance and history", async () => {
  const h = harness(), p = h.page().NEXORA;
  await p.Storage.set({ builderDraft: { name: "پیش‌نویس", colors: p.PRESET_THEMES[1].colors, editingId: null }, language: "fa" });
  const settings = await h.page().NEXORA.Storage.get();
  assert.equal(settings.activeThemeId, "dark"); assert.equal(settings.customThemeApplied, false);
  assert.equal(settings.builderDraft.name, "پیش‌نویس"); assert.equal(settings.language, "fa"); assert.equal(settings.appearanceHistory.length, 0);
  await assert.rejects(p.Storage.set({ language: "unknown" }), /language/);
  await assert.rejects(p.Storage.set({ builderDraft: { name: "Bad", colors: { background: "url(evil)" } } }), /Invalid color/);
});

test("persistent appearance history restores typography, CSS and palette while preserving library and preferences", async () => {
  const h = harness(), p = h.page().NEXORA;
  await p.Storage.selectTheme("dracula");
  await p.Storage.set({ typography: { fontSize: 18 }, customCss: "body { padding: 1px; }", customCssEnabled: true });
  await p.Storage.set({ language: "fa", builderDraft: { name: "Keep me", colors: p.PRESET_THEMES[0].colors } });
  await p.Storage.toggleFavorite("dracula"); await p.Storage.savePersonal({ name: "Saved", colors: p.PRESET_THEMES[0].colors });
  const history = (await h.page().NEXORA.Storage.get()).appearanceHistory;
  assert.equal(history.length, 2);
  const restored = await p.Storage.restoreHistory(0, history[0].at);
  assert.equal(restored.activeThemeId, "dark"); assert.equal(restored.typography.fontSize, 14); assert.equal(restored.customCss, "");
  assert.equal(restored.language, "fa"); assert.equal(restored.personalThemes.length, 1); assert.equal(restored.favoriteThemeIds[0], "dracula");
  assert.equal(restored.builderDraft.name, "Saved"); assert.equal(restored.appearanceHistory.length, 0);
  await assert.rejects(p.Storage.restoreHistory(0, history[0].at), /no longer exists/);
});

test("history is bounded, ignores no-op changes and rejects stale entries from another panel", async () => {
  const h = harness(), a = h.page().NEXORA.Storage, b = h.page().NEXORA.Storage;
  for (let i = 0; i < 23; i++) await a.selectTheme(i % 2 ? "dark" : "light");
  let settings = await a.get(); assert.equal(settings.appearanceHistory.length, 20);
  const stale = settings.appearanceHistory[0];
  await b.selectTheme("dracula");
  await assert.rejects(a.restoreHistory(0, stale.at), /no longer exists/);
  await a.selectTheme("dracula");
  settings = await a.get(); assert.equal(settings.appearanceHistory.length, 20);
  assert.ok(Buffer.byteLength(JSON.stringify(settings)) < h.page().NEXORA.Validator.MAX_IMPORT_BYTES);
});

test("corrupt libraries and unsafe historical CSS cannot be restored", async () => {
  const h = harness(), p = h.page().NEXORA;
  const theme = { id: "personal-one", name: "One", colors: p.PRESET_THEMES[0].colors };
  for (const personalThemes of [[theme, theme], [{ ...theme, id: "dark" }], Array.from({ length: 51 }, (_, i) => ({ ...theme, id: `personal-${i}` }))]) {
    await assert.rejects(p.Storage.restore({ personalThemes }));
  }
  await assert.rejects(p.Storage.restore({ appearanceHistory: [{ at: 1, appearance: { customCss: "a { background: url(https://evil); }" } }] }), /External resources/);
  const settings = await p.Storage.get(); assert.equal(settings.personalThemes.length, 0); assert.equal(settings.appearanceHistory.length, 0);
});

test("repository themes are local snapshots, isolated from global appearance and included in backups", async () => {
  const h = harness(), a = h.page().NEXORA, b = h.page().NEXORA;
  const theme = { name: "Repository palette", colors: a.getThemeById("nord").colors };
  const saved = await a.Storage.savePersonal(theme);
  const personalId = saved.personalThemes[0].id;
  await Promise.all([
    a.Storage.setRepositoryTheme("Owner/First.Repo", saved.personalThemes[0]),
    b.Storage.setRepositoryTheme("owner/second", b.getThemeById("light")),
    b.Storage.set({ autoDarkMode: true })
  ]);
  await a.Storage.deletePersonal(personalId);
  const backup = JSON.parse(JSON.stringify(await a.Storage.get()));
  assert.equal(backup.repositoryThemes["owner/first.repo"].name, theme.name);
  assert.equal(backup.repositoryThemes["owner/second"].name, b.getThemeById("light").name);
  assert.equal(backup.autoDarkMode, true);
  assert.equal(backup.appearanceHistory.length, 1);
  await a.Storage.reset();
  assert.deepEqual(Object.keys((await a.Storage.get()).repositoryThemes), []);
  await a.Storage.restore(backup);
  const restored = await a.Storage.restoreHistory(0, backup.appearanceHistory[0].at);
  assert.equal(restored.autoDarkMode, false);
  assert.equal(restored.repositoryThemes["owner/first.repo"].name, theme.name);
  await a.Storage.setRepositoryTheme("OWNER/First.Repo", null);
  assert.deepEqual(Object.keys((await b.Storage.get()).repositoryThemes), ["owner/second"]);
  await assert.rejects(a.Storage.setRepositoryTheme("owner/../second", theme), /Invalid repository name/);
  await assert.rejects(a.Storage.restore({ repositoryThemes: { "owner/repo": theme, "Owner/Repo": theme } }), /duplicate/);
  await assert.rejects(a.Storage.restore({ repositoryThemes: { "owner/repo": { colors: { background: "url(evil)" } } } }), /Invalid color/);
});
